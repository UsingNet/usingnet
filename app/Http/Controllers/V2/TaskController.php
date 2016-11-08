<?php

namespace App\Http\Controllers\V2;

use Redis;
use Config;
use Validator;
use App\Library\Syslog;
use App\Models\Bill;
use App\Models\Setting\Mail;
use App\Models\Setting\Sms;
use App\Models\Media;
use App\Models\Tasklist;
use App\Models\Task;
use App\Models\User;
use App\Models\Team;
use App\Models\Contact;
use App\Http\Requests;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // 分配给客服的任务
        if ($request->user()->role == User::ROLE_MEMBER) {
             $taskIds = Task::where('team_id', $request->user()->team_id)
                ->join('task_user', 'task_user.task_id', '=', 'task.id')
                ->where('task_user.user_id', $request->user()->id)
                ->select('task.id')
                ->get()
                ->lists('id');

             return $this->responseJson(Tasklist::whereIn('task_id', $taskIds)->where('status', Tasklist::STATUS_INIT)->with('contact')->get());
        }

        $tasks = Task::where('team_id',$request->user()->team_id);

        return $this->listToPage($tasks);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->only('type', 'title', 'assigners', 'receivers', 'media_id', 'start_time', 'end_time', 'reference');
        $team = $request->user()->team;
        $redis = Redis::connection();

        if ($data['type'] === Task::TYPE_SMS && $team->sms->status !== Sms::STATUS_SUCCESS) {
            return $this->responseJsonError('先先完成短信接入', 403);
        }

        if ($data['type'] === Task::TYPE_MAIL && $team->mail->status !== Mail::STATUS_SUCCESS) {
            return $this->responseJsonError('请先完成邮件接入', 403);
        }

        if (in_array($data['type'], [Task::TYPE_VOICE_RECORD, Task::TYPE_VOICE_STAFF]) && $team->voip->status !== \App\Models\Setting\Voip::STATUS_SUCCESS) {
            return $this->responseJsonError('请先完成电话接入', 403);
        }

        if ($data['start_time'] && $data['end_time']) {
            $data['start_time'] = date('H:i', strtotime($data['start_time']));
            $data['end_time'] = date('H:i', strtotime($data['end_time']));
        }

        $team = Team::find($request->user()->team_id);
        $data['team_id'] = $team->id;
        $data['user_id'] = $request->user()->id;
        $data['status'] = Task::STATUS_INIT;

        if ($request->get('assigners_all')) {
            $data['assigners'] = User::where('team_id', $team->id)->lists('id')->toArray();
        }

        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if ($data['type'] == Task::TYPE_VOICE_STAFF && empty($data['assigners'])) {
            return $this->responseJsonError('客服不能为空', 403);
        }

        if (!empty($data['media_id'])) {
            $media = Media::find($data['media_id']);
            if (!$media) {
                return $this->responseJsonError('媒体文件不存在', 404);
            }
            if ($media->status != Media::STATUS_SUCCESS) {
                return $this->responseJsonError('媒体未通过审核', 403);
            }
        }

        if (is_numeric($data['receivers'][0])) {
            $contacts = Contact::whereIn('id', $data['receivers'])->get();
            $key = 'task_' . new \MongoDB\BSON\ObjectID();
            $datas = [];
            foreach ($contacts as $contact) {
                $datas[] = [
                    'name' => $contact->name,
                    'email' => $contact->email,
                    'phone' => $contact->phone
                ];
            }
            $redis->set($key, json_encode($datas));
            $data['receivers'] = [$key];
            $receivers = $contacts->count();
        } else {
            $receivers = count(json_decode($redis->get($data['receivers'][0]), true));
        }

        $data['jobs'] = $receivers;
        $prices = [
            Task::TYPE_SMS => Config::get('price.sms'),
            Task::TYPE_VOICE_RECORD => Config::get('price.voip'),
            Task::TYPE_VOICE_STAFF => Config::get('price.voip'),
        ];

        if (isset($prices[$data['type']])) {
            $costs = $prices[$data['type']] * $receivers;

            if ($costs > $team->balance) {
                return $this->responseJsonError('余额不足', 403);
            }

            Syslog::logger('PLAY')->addDebug('PLAY_START', [
                'costs' => $costs,
                'team' => $team,
                'user' => $request->user(),
                'data' => $data
            ]);

            $team->trade(-$costs);
            Bill::create([
                'type' => 'TASK_' . $data['type'],
                'team_id' => $team->id,
                'money' => $costs
            ]);
        }

        $task = Task::create($data);

        // 人工任务
        if (!empty($data['assigners'])) {
            $task->assigners()->sync($data['assigners']);
            $task->receivers()->sync($contacts->lists('id')->toArray());
            return $this->responseJson($task);
        }

        $redis->lpush(Task::REDIS_KEY, json_encode([
            'id' => $task['id'],
            'receivers' => $data['receivers'][0],
            'team' => $team,
            'type' => $data['type'],
            'mail' => $team->mail,
            'voip' => [
                'number' => $team->voip->number
            ],
            'media' => [
                'title' => $media->title,
                'content' => $media->content
            ],
            'sms' => [
                'signature' => $team->sms->signature
            ]
        ]));

        return $this->responseJson($task);
    }

    /**
     * Display the specified resource.
     *
     * @param Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $model = Task::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if(!$model){
            return $this->responseJsonError('任务不存在', 404);
        }

        return $this->responseJson($model);
    }

    public function update(Request $request, $id)
    {

    }

    /**
     * @param Request $request
     * @param $id
     * @return mixed
     */
    public function destroy(Request $request, $id)
    {
        $taskModel = Task::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();

        if (!$taskModel) {
            return $this->responseJsonError('任务不存在', 404);
        }

        if ($taskModel->status != Task::STATUS_INIT) {
            return $this->responseJsonError('任务已经执行，不能删除', 403);
        }

        return $this->responseJson($taskModel->delete());
    }

    public function Validator(array $data){
        $v = Validator::make($data, [
            'type' => 'required|in:'.implode(',',[Task::TYPE_MAIL,Task::TYPE_SMS,Task::TYPE_VOICE_RECORD,Task::TYPE_VOICE_STAFF]),
            'title' => 'required|string|max:64|min:2',
            'receivers' => 'required|array',
            'assigners' => 'array'
        ], [
            'title.min' => '标题只能为 2 - 64 位字符',
            'title.max' => '标题只能为 2 - 64 位字符',
            'type.in' => '任务类型不正确',
            'type.required' =>  '工单类型不能为空',
            'title.required' =>  '标题不能为空',
            'receivers.required' => '客户不能为空',
        ]);

        $v->sometimes(['assigners'], 'required', function ($data) {
            return $data['type'] == Task::TYPE_VOICE_STAFF;
        });

        return $v;
    }

}