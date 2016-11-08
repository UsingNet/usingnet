<?php

/**
 * 子任务
 */

namespace App\Http\Controllers\V2;

use App\Models\Contact;
use App\Models\Order;
use App\Models\Task;
use App\Models\Message;
use App\Models\Tasklist;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TasklistController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // 当前用户的任务
        if ($id = $request->get('id')) {
            $tasklist = Tasklist::where('user_id', $request->user()->id)
                ->where('status', Tasklist::STATUS_COMPILE)
                ->with('task')
                ->with('contact')
                ->orderBy('id', 'desc')
                ->get();

            return $this->responseJson($tasklist);
        }

        // 团队中和当前用户相关的任务
        $handler = Task::where('status', '<>', Task::STATUS_FINISH)
            ->where('team_id', $request->user()->team_id)
            ->where('type', Task::TYPE_VOICE_STAFF);

        if ($request->user()->role == User::ROLE_MEMBER) {
            $taskids = \DB::table('task_user')->where('user_id', $request->user()->id)->lists('task_id');
            if (!empty($taskids)) {
                $handler->whereIn('id', $taskids);
            } else {
                return $this->responseJson([]);
            }
        }

        $tasks = $handler->get();

        return $this->responseJson($tasks);
    }

    /**
     * 领取任务
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $taskId)
    {
        $task = Task::where(['id' => $taskId, 'team_id' => $request->user()->team_id])
            ->where('status', '<>', Task::STATUS_FINISH)
            ->first();

        if (!$task) {
            return $this->responseJsonError('任务不存在', 404);
        }

        $contactIds = $task->receivers(Task::STATUS_CONTACT_UNASSIGNED)->lists('contact_id')->toArray();

        if (empty($contactIds)) {
            return $this->responseJsonError('任务已分配完毕', 403);
        }

        $contactId = $contactIds[0];
        $contact = Contact::find($contactId);
        $order = Order::where(['team_id' => $task->team_id, 'contact_id' => $contact->id])
            ->whereIn('status', [Order::STATUS_OPEN, Order::STATUS_SLEEP])
            ->first();
        if ($order) {
            return $this->responseJsonError('当前客户正在对话中, 对话结束后才能开始任务', 403);
        }

        $task->receivers()->where('contact_id', $contactId)->update(['status' => Task::STATUS_CONTACT_ASSIGNED]);
        $task->increment('progress');
        $task->status = Task::STATUS_COMPILE;
        $task->save();

        // 生成一条任务工单
        $order = Order::create([
            'from' => $request->user()->team->token,
            'to' => $contact->token,
            'contact_id' => $contact->id,
            'team_id' => $request->user()->team_id,
            'type' => Message::TYPE_VOIP,
            'user_id' => $request->user()->id,
            'task_id' => $task->id,
            'status' => Order::STATUS_OPEN
        ]);

        return $this->responseJson($order);
    }

    /**
     * 完成子任务
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $tasklistModel = Tasklist::where(['status' => Tasklist::STATUS_COMPILE, 'id' => $id])->first();
        if(!$tasklistModel){
            return $this->responseJsonError('任务不存在', 404);
        }

        $tasklistModel->status = Task::STATUS_FINISH;
        $tasklistModel->save();
        $count = Tasklist::where('status', Task::STATUS_FINISH)->where('task_id', $tasklistModel->task_id)->count();

        if ($tasklistModel->task->jobs == $count) {
            $tasklistModel->task()->update(['status' => Task::STATUS_FINISH]);
        }

        return $this->responseJson(true);
    }
}
