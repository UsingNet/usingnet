<?php

namespace App\Http\Controllers\Api;

use App\Models\CustomerManage;
use Redis;
use Config;
use Validator;
use App\Models\Message;
use App\Models\Order;
use App\Models\Tag;
use App\Models\Task;
use App\Models\User;
use App\Http\Requests;
use App\Models\Contact;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;

class ContactController extends Controller
{
    protected $allows = ['xls', 'xlsx', 'csv'];

    /**
     * 客户列表
     * @param Request $request
     * @return mixed
     */
    public function index(Request $request)
    {
        $handler = Contact::orderBy('id', 'desc')
            ->with('tags');

        if (!CustomerManage::isManager($request->user()->team_id)) {
            $handler->where('team_id', $request->user()->team_id);
        }

        if ($query = $request->get('query')) {
            $handler->where(function ($q) use ($query) {
                 $q->where('name', 'like', "%{$query}%")
                     ->orWhere('nickname', 'like', "%$query%")
                     ->orWhere('id', $query)
                     ->orWhere('phone', $query)
                     ->orWhere('email', $query)
                     ->orWhere('openid', $query);
            });
        }

        if ($filters = $request->get('filter')) {
            $fields = [
                'phone' => 'phone',
                'email' => 'email',
                'wechat' => 'openid',
                'weibo' => 'weibo_id'
            ];

            if (is_array($filters)) {
                foreach ($filters as $item) {
                    if (isset($fields[$item])) {
                        $handler->where($fields[$item], '<>', '');
                    }
                }
            }
        }

        if ($tags = $request->get('tags')) {
            if (is_array($tags) && !empty($tags)) {
                $tagIds = Tag::whereIn('name', $tags)->lists('id')->toArray();
                if (!empty($tagIds)) {
                    $handler->whereHas('tags', function ($q) use ($tagIds) {
                        $q->whereIn('tag.id', $tagIds);
                    }, '=', count($tags));
                }
            }
        }

        return $this->listToPage($handler, function ($contacts) use ($request) {
            foreach ($contacts as $contact) {
                $contact->source_tags = $contact->tags;
                $tags = array_fetch($contact->tags->toArray(), 'name');
                unset($contact->tags);
                $contact->tags = $tags;
                $contact->source = parse_source($contact->package['referrer']);
                if ($request->user()->role != User::ROLE_MASTER) {
                    $contact->phone = preg_replace('/(\d{3})\d+(\d{4})/', '$1*****$2', $contact->phone);
                    $contact->email = preg_replace('/(\w{2})\w?(\w{2})?@/', '$1*****$2@', $contact->email);
                }
            }
        });
    }

    /**
     * 添加联系人
     * @param Request $request
     * @return mixed
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $data = array_filter($request->only('name', 'email', 'phone', 'tags', 'remark', 'contacts'));
        $data['user_id']  = $user->id;

        if($request->hasFile('contacts')){
            $file = $request->file('contacts');
            $filename = $file->getPathname();
            $ext = strtolower($file->getClientOriginalExtension());
            if (!in_array($ext, ['xls', 'xlsx', 'csv'])) {
                return $this->responseJsonError('类型只允许 xls xlsx csv', 403);
            }

            $datas = $this->createContactByFile($filename, $user->team);
            \DB::table('contact')->insert($datas);
            if (count($datas)) {
                return $this->responseJson(sprintf('成功导入了 %s 个客户', count($datas)));
            } else {
                return $this->responseJsonError('文件已经导过了 或 格式不正确', 403);
            }
        }else{
            $validator = $this->validator($data, $user->team_id);
            if ($validator->fails()) {
                $errors = $validator->messages()->all();
                return $this->responseJsonError(implode(' ', $errors), 403);
            }

            // 验证手机格式
            if (isset($data['phone'])) {
                $phoneReg = Config::get('regular.phone');
                if (!preg_match($phoneReg, $data['phone'])) {
                    return $this->responseJsonError('电话号码格式不正确', 403);
                }
            }

            $data['team_id'] = $user->team_id;
            $contact = Contact::create($data);
            if (!empty($data['tags'])) {
                $tagIds = [];
                foreach ($data['tags'] as $tag) {
                    $tag = Tag::firstOrCreate(['name' => $tag, 'team_id' => $request->user()->team_id]) ;
                    $tagIds[] = $tag->id;
                }
                $contact->tags()->sync($tagIds);
            }

            if (isset($_GET['tags']) && !$_GET['tags']) {
                $contact->tags()->sync([]);
            }

            return $this->responseJson($contact);
        }
    }

    /**
     * 显示联系人
     * @param Request $request
     * @param $id
     * @return mixed
     */
    public function show(Request $request, $id)
    {
        $contact = Contact::withTrashed()
            ->where('id', $id)
            ->with('tags')
            ->orderBy('id', 'desc');

        if ($request->user()->team_id != env('MANAGE_TEAM_ID')) {
            $contact->where('team_id', $request->user()->team_id);
        }

        $contact = $contact->first();
        if(!$contact){
            return $this->responseJsonError('联系人不存在', 404);
        }

        return $this->responseJson($contact);
    }

    /**
     * 更新联系人
     * @param Request $request
     * @param $id
     * @return mixed
     */
    public function update(Request $request, $id)
    {
        $contact = Contact::where(['id' => $id]);

        if (!CustomerManage::isManager($request->user()->team_id)) {
            $contact->where('team_id', $request->user()->team_id);
        }

        $contact = $contact->first();

        if(!$contact){
            return $this->responseJsonError('联系人不存在', 404);
        }

        $data = $request->all();
        $data['id'] = $id;

        if (!empty($data['email']) && preg_match('/\*{5}/', $data['email'])) {
            unset($data['email']);
        }

        if (!empty($data['phone']) && preg_match('/\*{5}/', $data['phone'])) {
            unset($data['phone']);
        }

        $validator = $this->validator($data, $request->user()->team_id, $id);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if (isset($data['name']) && empty($data['name'])) {
            return $this->responseJsonError('姓名不能为空', 403);
        }


        if (!empty($data['phone'])) {
            $phoneReg = Config::get('regular.phone');
            if (!preg_match($phoneReg, $data['phone'])) {
                return $this->responseJsonError('手机号码格式不正确', 403);
            }
        }

        $tags = [];
        if (isset($data['tags']) &&is_array($data['tags'])) {
            $tagIds = [];
            foreach ($data['tags'] as $tag) {
                $tag = Tag::firstOrCreate(['name' => $tag, 'team_id' => $contact->team_id]) ;
                $tags[] = $tag;
                $tagIds[] = $tag->id;
            }
            $contact->tags()->sync($tagIds);
        }

        if (isset($data['tags']) && !$data['tags']) {
            $contact->tags()->sync([]);
        }

        $extend = [];
        if (isset($data['extend']) && is_array($data['extend'])) {
            foreach ($extend as $item) {
                if (isset($item['key']) && isset($item['value'])) {
                    $extend[] = $item;
                }
            }
        }

        $data['extend'] = $extend;
        $contact->update($data);
        $contact = Contact::where('id', $contact->id)->with('tags')->first();

        return $this->responseJson($contact);
    }

    /**
     * 删除联系人
     * @param Request $request
     * @param $id
     * @return mixed
     */
    public function destroy(Request $request, $id)
    {
        $contact = Contact::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if(!$contact){
            return $this->responseJsonError('联系人不存在', 404);
        }

        if ($order = Order::where(['status' => Order::STATUS_OPEN, 'contact_id' => $id, 'team_id' => $request->user()->team_id])->first()) {
            return $this->responseJsonError('客户正在对话中不能删除', 403);
        }

        if (Task::join('task_contact as tc', 'tc.task_id', '=', 'task.id')->where('tc.contact_id', $id)
                ->where('task.status', '<>',Task::STATUS_FINISH)->first()) {
            return $this->responseJsonError('正在执行计划的用户不能删除', 403);
        }

        // 删除客户数据
        \DB::table('task_contact')->where('contact_id', $id)->delete();
        $orders = Order::where('contact_id', $id)->get();
        foreach ($orders as $order) {
            Message::where(['from' => $order->from, 'to' => $order->to])
                ->orWhere(['from' => $order->to, 'to' => $order->from])
                ->delete();
            $order->delete();
        }

        return $this->responseJson($contact->delete());
    }

    public function validator(array $data, $teamId = 0, $id = NULL)
    {
        return Validator::make($data, [
            'name' => 'required_without:id|min:2|max:15',
            'email' => 'email|unique:contact,email,'. $id .',id,team_id,' . $teamId,
            'phone' => 'unique:contact,phone,'. $id .',id,team_id,' . $teamId,
            'remark' => 'min:2|max:15',
        ], [
            'name.required_without' =>  '姓名不能为空',
            'name.min' => '名字为2-15个字符',
            'name.max' => '名字为2-15个字符',
            'email.email' => '邮箱格式不正确',
            'email.unique' => '邮箱已存在',
            'phone.unique' => '手机号码已存在',
            'remark.min' => '备注为2-15个字符',
            'remark.max' => '备注为2-15个字符'
        ]);
    }

    /**
     * 添加任务时 导入联系人
     * @request
     * return json
     */
    public function postImport(Request $request)
    {
        $ids = [];
        $key = 'task_' . new \MongoDB\BSON\ObjectID();
        $redis = Redis::connection();

        if ($request->hasFile('contacts')) {
            $path = storage_path('contacts/' . date('Y/m/d/'));
            if (!is_dir($path)) {
                mkdir($path, 0777, true);
            }

            $file = $request->file('contacts');
            if ($file->getClientMimeType() === 'application/zip') {
                $zip = zip_open($file->getPathname());
                $datas = [];
                $i = 0;
                while ($entry = zip_read($zip)) {
                    $entryName = zip_entry_name($entry);
                    $ext = pathinfo($entryName, PATHINFO_EXTENSION);
                    $content = zip_entry_read($entry, zip_entry_filesize($entry));
                    zip_entry_close($entry);
                    if (in_array($ext, $this->allows)) {
                        $filename = $path . time() . $i . '.' .$ext;
                        file_put_contents($filename, $content);
                        $datas = array_merge($datas, $this->createContactByFile($filename));
                    }
                    $i++;
                }
                zip_close($zip);
            } else {
                $ext = $file->getClientOriginalExtension();
                if (!in_array($ext, $this->allows)) {
                    return $this->responseJsonError(sprintf('只允许 %s 格式文件', implode(',', $this->allows)), 403);
                }
                $filename = $path . time() . '.' . $ext;
                file_put_contents($filename, file_get_contents($file->getPathname()));
                $datas = $this->createContactByFile($filename);
            }

            if (!empty($datas)) {
                $datas = array_map('unserialize', array_unique(array_map('serialize', $datas)));
                $redis->set($key, json_encode($datas));
                $ids = [$key];
            }
        } else {
            $handle = Contact::where('contact.team_id', $request->user()->team_id)
                ->select('contact.*');

            if ($tag = $request->get('tag')) {
                if (!is_array($tag)) {
                    $tag = [$tag];
                }

                $ids = $handle->join('contact_tag as ct', 'ct.contact_id', '=','contact.id')
                    ->join('tag', 'tag.id', '=','ct.tag_id')
                    ->whereIn('tag.id', $tag)
                    ->get()
                    ->lists('id')
                    ->toArray();
            }

            $fields = ['id', 'email', 'openid', 'uid'];

            foreach ($fields as $field) {
                $where = $request->get($field);
                if ($where) {
                    if (!is_array($where)) {
                        $where = [$where];
                    }
                    $ids = $handle->whereIn($field, $where)->lists('id');
                }
            }

            if (!empty($ids)) {
                $contacts = Contact::whereIn('id', $ids)->get();
                $ids = [$key];
                $datas = [];
                foreach ($contacts as $contact) {
                    $datas[] = [
                        'name' => $contact->name,
                        'email' => $contact->email,
                        'phone' => $contact->phone
                    ];
                }
                $redis->set($key, json_encode($datas));
            }
        }

        return $this->responseJson(['data' => $ids]);
    }

    /**
     * 从文件添加联系人
     * @filename 文件地址
     * @teamid 团队 id
     * @return array
     */
    private function createContactByFile($filename)
    {
        $datas = [];
        Excel::load($filename,function($reader) use (&$datas){
            $reader->each(function($sheet) use (&$datas){
                if ($sheet instanceof  \Maatwebsite\Excel\Collections\RowCollection) {
                    $sheet->each(function($row) use (&$datas) {
                        try{
                            $data = array_filter([
                                'name' => $row->name,
                                'email' => $row->email,
                                'phone' =>$row->phone
                            ]);
                            if (!empty($data)) {
                                $datas[] = $data;
                            }
                        } catch (\Exception $e){
                        }
                    });
                }

                if ($sheet instanceof \Maatwebsite\Excel\Collections\CellCollection) {
                    try{
                        $data = array_filter([
                            'name' => $sheet->name,
                            'email' => $sheet->email,
                            'phone' =>$sheet->phone,
                        ]);
                        if (!empty($data)) {
                            $datas[] = $data;
                        }
                    } catch (\Exception $e){
                    }
                }
            });
        });

        return $datas;
    }
}
