<?php

namespace App\Http\Controllers\V2;

use App\Library\IP;
use App\Models\Contact;
use Cache;
use App\Models\Tasklist;
use App\Models\Visit;
use App\Services\Connect;
use Carbon\Carbon;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Models\OrderCategory;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    // 当前开始时间
    private $monthStartTime;

    public function __construct()
    {
        $this->monthStartTime = Carbon::createFromTimestamp(time() - (date('d') - 1) * 3600 * 24)->startOfDay();
    }

    public function getLump(Request $request)
    {
        $user = $request->user();
        $handler = Tasklist::where('team_id', $request->user()->team_id)
            ->where('created_at', '>', $this->monthStartTime)
            ->where('created_at', '<', Carbon::now());

        $tasks = $handler->get();
        $allTaskCount = $tasks->count();
        $selfTasks = $handler->where('user_id', $user->id)->get();
        $selfTaskCount = $selfTasks->count();
        // 有效工单
        $validTasks = $handler->where('exec_time', '<>', 0)->get();
        $validTaskCount = $validTasks->count();
        $selfValidTaskCount = $handler->where('exec_time', '<>', 0)->where('user_id', $user->id)->count();

        // 统计当前客服排名
        $agentTasks = [];
        $agentValidTasks = [];
        foreach ($tasks as $task) {
            if (isset($agentTasks[$task->user_id])) {
                $agentTasks[$task->user_id]++;
            } else {
                $agentTasks[$task->user_id] = 1;
            }
        }

        foreach ($validTasks as $task) {
            if (isset($agentValidTasks[$task->user_id])) {
                $agentValidTasks[$task->user_id]++;
            } else {
                $agentValidTasks[$task->user_id] = 1;
            }
        }

        $agentTasks = array_unique(array_values($agentTasks));
        $agentValidTasks = array_unique(array_values($agentValidTasks));
        sort($agentTasks, SORT_DESC);
        sort($agentValidTasks, SORT_DESC);

        if (count($agentTasks) == 0) {
            $taskRank = '暂无排名';
        } else {
            $taskIndex = array_search($selfTaskCount, $agentTasks);
            $taskRank = sprintf('第 %s 名', $taskIndex !== false ? ++$taskIndex : count($agentTasks) + 1);
        }

        if (count($agentValidTasks) == 0) {
            $validRank = '暂无排名';
        } else {
            $validIndex= array_search($selfValidTaskCount, $agentValidTasks);
            $validRank = sprintf('第 %s 名', $validIndex !== false ? ++$validIndex : count($agentValidTasks) + 1);
        }

        $validTask = 0 . '%';
        $selfValidTask = 0 . '%';
        if ($allTaskCount) {
            $validTask = intval($validTaskCount / $allTaskCount) * 100 . '%';
        }
        if ($validTaskCount) {
            $selfValidTask = intval($selfValidTaskCount / $validTaskCount) * 100 . '%';
        }

        $handler = Order::where(['team_id' => $request->user()->team_id])
            ->where('created_at', '>', $this->monthStartTime)
            ->where('created_at', '<', Carbon::now());

        $orders = $handler->get();
        $orderCount = $orders->count();
        $selfOrders = $handler->where('user_id', $user->id)->get();
        $selfOrderCount = $selfOrders->count();

        $agentOrders = [];
        $agentTimes = [];
        $totalTime = 0;
        foreach ($orders as $order) {
            $totalTime +=  strtotime($order->updated_at) - strtotime($order->created_at);
            if (isset($agentOrders[$order->user_id])) {
                $agentOrders[$order->user_id]++;
                $agentTimes[$order->user_id] += strtotime($order->updated_at) - strtotime($order->created_at);
            } else {
                $agentOrders[$order->user_id] = 1;
                $agentTimes[$order->user_id] = strtotime($order->updated_at) - strtotime($order->created_at);;
            }
        }

        $selfTotalTime = 0;
        foreach ($selfOrders as $order) {
            $selfTotalTime +=  strtotime($order->updated_at) - strtotime($order->created_at);
        }

        $agentOrders = array_unique(array_values($agentOrders));
        $agentTimes = array_unique(array_values($agentTimes));

        if (count($agentOrders) == 0) {
            $orderRank = '暂无排名';
        } else {
            $orderIndex = array_search($selfOrderCount, $agentOrders);
            $orderRank = sprintf('第 %s 名', $orderIndex !== false ? ++$orderIndex : count($agentOrders) + 1);
        }

        if (count($agentTimes) == 0) {
            $timeRank = '暂无排名';
        } else {
            $timeIndex = array_search($selfTotalTime, $agentTimes);
            $timeRank = sprintf('第 %s 名', $timeIndex !== false ? ++$timeIndex : count($agentTimes) + 1);
        }

        $avgTime = 0;
        $avgSelfTime = 0;
        if ($orderCount) {
            $avgTime = intval($totalTime / $orderCount);
        }
        if ($selfOrderCount) {
            $avgSelfTime = intval($selfTotalTime / $selfOrderCount);
        }

        return $this->responseJson(['data' => [
            'order_rank' => $orderRank,
            'time_rank' => $timeRank,
            'all_order_count' => $orderCount,
            'self_order_count' => $selfOrderCount,
            'avg_time' => $avgTime,
            'avg_self_time' => $avgSelfTime,
            'all_task' => $allTaskCount,
            'self_task' => $selfTaskCount,
            'valid_task' => $validTask,
            'self_valid_task' => $selfValidTask,
            'task_rank' => $taskRank,
            'valid_rank' => $validRank
        ]]);
    }

    /**
     * 客服负荷
     * Request $request
     */
    public function getAgent(Request $request)
    {
        $user = $request->user();
        $agents = [];
        $orders = Order::where('team_id', $user->team_id)
            ->with(['user' => function ($q) {
                $q->select('id', 'name');
            }])
            ->where('status', Order::STATUS_OPEN)
            ->with(['contact' => function ($q) {
                $q->select('id', 'name');
            }])
            ->where('user_id', '<>', 0)
            ->get();

        $onlines = agent_online($user->team_id);
        foreach ($onlines as $online) {
            $agents[$online['name']] = 0;
        }

        foreach ($orders as $order) {
            $order->time = format_time(time() - strtotime($order->created_at));
            if (isset($order->user->name)) {
                if (isset($agents[$order->user->name])) {
                    $agents[$order->user->name]++;
                }
            }
        }

        ksort($agents);

        return $this->responseJson([
            'agents' => $agents,
            'orders' => $orders
        ]);
    }

    /**
     * 工单趋势
     * 返回七天以内的工单问题趋势
     * Request $request
     */
    public function getOrdertrend(Request $request)
    {
        $data = \Cache::remember('ordertrend_' . $request->user()->team_id, 1, function () use ($request) {
            $start = Carbon::createFromTimestamp(strtotime('-30 days'));
            $categories_raw = OrderCategory::orderBy('order_count')
                ->where('order_count', '<>', 0)
                ->where('team_id', $request->user()->team_id)
                ->where('created_at', '>', $start)
                ->take(5)
                ->get();

            $orders = Order::where('team_id', $request->user()->team_id)
                ->where('created_at', '>', $start)
                ->where('category_id', '<>', 0)
                ->get();

            $categoryIds = $orders->lists('category_id')->toArray();

            $init_result = array();
            $categories = [];
            foreach($categories_raw as $category){
                if (!in_array($category->id, $categoryIds)) {
                    continue;
                }
                $categories[$category->id] = $category;
                $init_result[$category->title] = 0;
            }


            $data = [];
            for ($i = 31; $i >= 1; $i--) {
                $date = date('m-d', strtotime("-{$i}days"));
                $data[$date] = array(
                    'date'=>$date,
                    'result'=>$init_result
                );
            }

            foreach ($orders as $order) {
                $date = date('m-d', strtotime($order->created_at));

                if(!isset($categories[$order->category_id])){
                    continue;
                }
                $data[$date]['result'][$categories[$order->category_id]->title]++;
            }
            return array_values($data);
        });
        return $this->responseJson(['data' => $data]);
    }

    /**
     * 访客统计
     * @param Request $request
     */
    public function getVisitor(Request $request)
    {
        $visits = Visit::where('team_id', $request->user()->team_id)
            ->where('created_at', '>', $this->monthStartTime)
            ->get();

        $source = [];
        $location = [];
        $group = [];
        $group['访客'] = 0;
        foreach ($visits as $visit) {
            if (isset($source[$visit->referrer])) {
                $source[$visit->referrer]++;
            } else {
                $source[$visit->referrer] = 1;
            }

            $visit->location = str_replace('中国 ', '', $visit->location);
            $visit->location = explode(' ', $visit->location)[0];
            if (isset($location[$visit->location])) {
                $location[$visit->location]++;
            } else {
                $location[$visit->location] = 1;
            }

            if (!$visit->is_login) {
                $group['访客']++;
            }

            if ($visit->tags && is_array($visit->tags)) {
                foreach ($visit->tags as $tag) {
                    if (isset($group[$tag])) {
                        $group[$tag]++;
                    } else {
                        $group[$tag] = 0;
                    }
                }
            }
        }

        return $this->responseJson(['source' => $source, 'location' => $location, 'group' => $group]);
    }

    /**
     * 在线访客
     * @param Request $request
     * @return mixed
     */
    public function getOnline(Request $request)
    {
        $teamToken = $request->user()->team->token;
        $connect = new Connect(Connect::ONLINE_SERVER);
        $onlines = $connect->online($teamToken)['online'];
        $trackIds = array_fetch($onlines, 'track_id');
        $contacts = Contact::where('team_id', $request->user()->team_id)
            ->whereIn('track_id', $trackIds)
            ->get()
            ->toArray();

        foreach ($onlines as &$online) {
            $trackIds = array_fetch($contacts, 'track_id');
            $online['contact_id'] = 0;
            if (in_array($online['track_id'], $trackIds)) {
                foreach ($contacts as $contact) {
                    if ($contact['track_id'] == $online['track_id']) {
                        $online['name'] = $contact['name'];
                        $online['contact_id'] = $contact['id'];
                    }
                }
            } else {
                $location = IP::find($online['ip']);
                $online['name'] = trim($location[1] . ' ' . $location[2]) . '的访客';
            }
        }

        return $this->responseJson(['data' => $onlines]);
    }
}
