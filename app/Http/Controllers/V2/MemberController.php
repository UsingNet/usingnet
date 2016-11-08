<?php

namespace App\Http\Controllers\V2;

use Config;
use Validator;
use App\Models\User;
use App\Models\Tag;
use App\Models\Member;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class MemberController extends Controller
{
    /**
     * 成员列表
     * @param Request $request
     * @return mixed
     */
    public function index(Request $request)
    {
        $users = User::where('team_id', $request->user()->team_id)->with('tags')->with('voip')->get();

        return $this->responseJson($users);
    }

    /**
     * 添加成员
     * @param Request $request
     * @return mixed
     */
    public function store(Request $request)
    {
        $data = array_filter($request->only('name', 'email', 'role', 'password', 'tags', 'phone'));
        $data['team_id'] = $request->user()->team_id;
        $data['status'] = User::STATUS_ACTIVE;

        if ($request->user()->role == USER::ROLE_MANAGE || !isset($data['role'])) {
            $data['role'] = User::ROLE_MEMBER;
        }

        $validator = $this->validator($data, $request->user()->team_id);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $member = User::create($data);
        if (!empty($data['tags'])) {
            $tagIds = [];
            foreach ($data['tags'] as $tag) {
                $tag = Tag::firstOrCreate(['name' => $tag, 'team_id' => $request->user()->team_id]) ;
                $tagIds[] = $tag->id;
            }
            $member->tags()->sync($tagIds);
        }


        $member = User::with('tags')->where('id', $member->id)->first();

        return $this->responseJson($member);
    }

    /**
     * 显示用户
     * @param Request $request
     * @param $id
     * @return mixed
     */
    public function show(Request $request, $id)
    {
        $member = User::where(['id' => $id, 'team_id' => $request->user()->team_id])->with('tags')->first();
        if (!$member) {
            return $this->responseJsonError('成员不存在', 404);
        }

        return $this->responseJson($member);
    }

    /**
     * 修改用户
     * @param Request $request
     * @param $id
     * @return mixed
     */
    public function update(Request $request, $id)
    {
        $data = array_map(function($item){
            if ($item === null) {
                return '';
            }
            return $item;
        }, $request->all());

        $data['team_id'] = $request->user()->team_id;
        $member = User::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        if (!$member) {
            return $this->responseJsonError('成员不存在', 404);
        }

        if ($data['role'] === User::ROLE_MASTER && $request->user()->role !== User::ROLE_MASTER) {
            return $this->responseJsonError('权限错误', 403);
        }

        $validator = $this->validator($data, $request->user()->team_id, $id);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if ($id == $request->user()->id) {
            $data['role'] = $request->user()->role;
        }

        if ($member->id == $request->user()->id) {
            $data['role'] = $request->user()->role;
        }

        if (!empty($data['tags'])) {
            $tagIds = [];
            foreach ($data['tags'] as $tag) {
                $tag = Tag::firstOrCreate(['name' => $tag, 'team_id' => $request->user()->team_id]) ;
                $tagIds[] = $tag->id;
            }
            $member->tags()->sync($tagIds);
        } else {
            $member->tags()->sync([]);
        }

        $member->fill($data);
        $member->save();

        return $this->responseJson($member);
    }

    /**
     * 删除用户
     * @param Request $request
     * @param $id
     * @return mixed
     */
    public function destroy(Request $request, $id)
    {
        $member = User::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        if (!$member) {
            return $this->responseJsonError('成员不存在', 404);
        }

        if ($member->id == $request->user()->id) {
            return $this->responseJsonError('不能删除自己', 403);
        }

        if ($member->role == User::ROLE_MANAGE && $request->user()->role != User::ROLE_MASTER) {
            return $this->responseJsonError('您不能删除管理员', 403);
        }

        if ($member->role == User::ROLE_MASTER) {
            return $this->responseJsonError('所有者不能被删除', 403);
        }

        $member->email = microtime(true) . rand(11111, 99999);
        $member->name = '已删除';
        $member->save();

        // 关闭子账号
        if ($member->voip) {
            $member->closeVoipAccount();
        }

        return $this->responseJson($member->delete());
    }

    public function validator(array $data, $teamId, $id = null)
    {
        $phoneRegex = Config::get('regular.phone');
        return Validator::make($data, [
            'name' => 'required_without:id|min:2|max:10|unique:user,name,' . $id . ',id,team_id,' . $teamId,
            'email' => 'required_without:phone|email|unique:user,email,' . $id,
            'phone' => ['regex:' . $phoneRegex, 'unique:user,phone,' . $id],
            'password' => 'required_without:id|min:6',
            'role' => 'in:' . implode(',', [User::ROLE_MANAGE, User::ROLE_MEMBER, User::ROLE_MASTER])
        ], [
            'name.required_without' => '请填写名字',
            'name.unique' => '名字不能重复',
            'name.min' => '名字只能为 2 到 10个字符',
            'name.max' => '名字只能为 2 到 10 个字符',
            'email.required_without' => '请填写邮箱或手机号码',
            'email.unique' => '邮箱已存在',
            'phone.unique' => '手机号码已存在',
            'email.email' => '邮箱格式不正确',
            'phone.regex' => '手机号码格式不正确',
            'password.required_without' => '请填写密码',
            'password.min' => '密码不能少于 6 个字符',
            'role.in' => '请选择正确的角色'
        ]);
    }
}
