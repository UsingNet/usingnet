<?php

namespace App\Http\Controllers\V2;

use App\Models\CustomerManage;
use Auth;
use Config;
use Validator;
use Response;
use App\Models\Order;
use App\Models\User;
use App\Models\Attachment;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use App\Models\Team;

class UserController extends Controller
{
    /**
     * 登录到客户团队
     */
    public function getCustomer(Request $request)
    {
        if (CustomerManage::isManager($request->user()->team_id)) {
            $team = Team::find($request->get('team_id'));
            if ($team) {
                $user = User::where('role', User::ROLE_MASTER)->where('team_id', $team->id)->first();
                Auth::login($user);
                $sso = Str::random(30);
                $user->sso = $sso;
                $user->save();
                $soo = cookie()->forever('usingnet_sso', $sso);
                setcookie('online', 0, time()+3600, '/', env('DOMAIN'));
                return redirect('/')->withCookie($soo);
            }
        }
    }

    /**
     * 当前用户信息
     * @param Request $request
     * @return mixed
     */
   public function getMe(Request $request)
    {
        if ($request->user()) {
            $user = $request->user()->where('id', $request->user()->id)->with('tags')->first();
            $data['data'] = array_merge($user->toArray(), ['logout' => Config::get('auth.login') . '/logout']);
            $data['data']['team_token'] = $request->user()->team->token;
            return $this->responseJson($data);
        }

        return $this->responseJsonError('登录超时', 408, ['login' => Config::get('auth.login')]);
    }

    /**
     * 客服头像
     * @param $token
     */
    public function getAvatar($token)
    {
        $user = User::where('token', $token)->first();
        if (!$user) {
            return $this->responseJsonError('客服不存在', 404);
        }

       return Response::make(file_get_contents($user->img))->header('Content-Type', 'image/jpeg');
    }

    /**
     * 修改个人资料
     * 客服只能修改密码
     *
     * @param Request $request
     * @return mixed
     */
    public function postMe(Request $request)
    {
        $data = array_filter($request->only('img', 'name', 'email', 'password', 'newpassword', 'newpassword_confirmation',
            'auto_offline', 'offline_time','extend'), function ($item) {
            if ($item !== null && $item !== '')  {
                return true;
            }
        });

        $user = $request->user();
        $validator = $this->validator($data, $user->id);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if ($password = $request->get('password')) {
            unset($data['password']);
            if (!Hash::check($password, $user->password)) {
                return $this->responseJsonError('密码不正确', 403);
            }
            if ($newpassword = $request->get('newpassword')) {
                $data['password'] = $data['newpassword'];
            }
        }

        if (!empty($data['img'])) {
            $data['img'] = str_replace('-avatar', '', $data['img']);
            Attachment::where('src', $data['img'])->increment('ref', -1);
            Attachment::where('src', $data['img'])->increment('ref', 1);
        }

        $user->fill($data);
        $user->save();

        return $this->responseJson($user);
    }

    /**
     * 保存用户操作设置
     * @param Request $request
     * @return mixed
     */
    public function postExtend(Request $request)
    {
        $key = $request->get('key');
        $val = $request->get('value');
        $extend = $request->user()->extend;
        if (!is_array($extend)) {
            $extend = [];
        }

        $extend[$key] = $val;
        $request->user()->extend = $extend;

        return $this->responseJson($request->user()->save());
    }

    /**
     * 超时登录
     * @param array $data
     * @param $id
     * @return mixed
     */
    public function postUnlock(Request $request)
    {
        $data = $request->only('email', 'password');
        $validator = Validator::make($data, [
            'password' => 'required|min:6'
        ], [
            'password.required' => '密码不能为空' ,
            'password.min' => '密码不能少于 6 位'
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            return $this->responseJsonError('用户不存在', 403);
        }

        if (!Hash::check($data['password'], $user->password)) {
            return $this->responseJsonError('密码不正确', 403);
        }

        Auth::login($user);

        // signle login
        $sso = Str::random(30);
        $user->sso = $sso;
        $user->save();
        $sso = cookie()->forever('usingnet_sso', $sso);

        return \Response::json(['success' => true, 'code'=>200, 'msg' => 'ok'])->withCookie($sso);
    }

    /**
     * 官网对接用户数据
     * @param Request $request
     */
    public function getCallback(Request $request)
    {
        if (!isset($_SERVER['HTTP_REFERER'])) {
            abort(404);
        }

        $refresh = $_SERVER['HTTP_REFERER'];
        $parse = parse_url($refresh);
        if ($parse['host'] !== 'www.' . env('APP_DOMAIN') && $parse['host'] !== env('APP_DOMAIN')) {
            exit;
        }

        if ($callback = $request->get('callback')) {
            $userInfo = [];
            if ($user = $request->user()) {
                $userInfo = [
                    'extend_id' => $user->token,
                ];
            }

            echo sprintf('%s(%s)', $callback, json_encode($userInfo));
        }
    }

    /**
     * 对接用户
     * @param Request $request
     */
    public function postCallback(Request $request)
    {
        $signature = $request->get('signature');
        $timestamp = $request->get('timestamp');
        $nonce = $request->get('nonce');
        $token = Config::get('app.key');
        $tmpArr = array($token, $timestamp, $nonce);
        sort($tmpArr, SORT_STRING);
        $tmpStr = implode( $tmpArr );
        $tmpStr = sha1( $tmpStr );
        if( $tmpStr !== $signature ){
            return [
                'ok' => false,
                'msg' => '请求参数错误'
            ];
        }

        if ($id = $request->get('extend_id')) {
            $user = User::where('token', $id)->first();
            if ($user) {
                return [
                    'ok' => true,
                    'data' => [
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'tags' => $user->tags->lists('name')->toArray(),
                        'extend' => [
                            [ 'key' => '团队名称', 'value' => $user->team->name],
                            [ 'key' => '当前套餐', 'value' => $user->team->plan->name],
                            [ 'key' => '账户余额', 'value' => $user->team->balance],
                            [ 'key' => '套餐时间', 'value' => $user->team->plan->slug === 'experience' ? '永久' : $user->team->plan->end_at],
                            [ 'key' => '团队人数', 'value' => User::where('team_id', $user->team_id)->count()]
                        ]
                    ]
                ];
            }
        }

        return ['ok' => false, 'msg' => '没有找到用户'];
    }

    /**
     * 坐席下线
     * @param $request
     */
    public function postOffline(Request $request)
    {
        Order::where('user_id', $request->user()->id)->where('status', Order::STATUS_OPEN)
            ->update(['status' => Order::STATUS_SLEEP]);
        Team::clearTeamInfoCache($request->user()->team);
        return $this->responseJson($request->user());
    }

    public function validator(array $data, $id)
    {
        return Validator::make($data, [
            'name' => 'min:2|max:10',
            'email' => 'email|unique:user,email,' . $id,
            'newpassword' => 'min:6|max:255|confirmed',
        ], [
            'name.min' => '名字只能为 2-10 个字符',
            'name.max' => '名字只能为 2-10 个字符',
            'email.email' => '邮箱格式不正确',
            'email.unique' => '邮箱已存在',
            'newpassword.min' => '密码不能少于 6 个字符',
            'newpassword.confirmed' => '两次密码输入不正确',
        ]);
    }
}
