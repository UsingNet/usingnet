<?php

namespace App\Http\Controllers\V2;

use App\Models\CustomerManage;
use App\Models\Evaluation;
use App\Models\Stats;
use App\Models\Stats\AgentTiming;
use App\Models\User;
use Carbon\Carbon;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Visit;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;

class StatsController extends Controller
{
    private $begin;
    private $end;

    public function __construct(Request $request)
    {
        $defaultBegin = Carbon::createFromTimestamp(time())->startOfDay();
        $defaultEnd = Carbon::createFromTimestamp(time())->endOfDay();
        $begin = $request->get('begin', $defaultBegin);
        $end = $request->get('end', $defaultEnd);
        $this->begin= Carbon::createFromTimestamp(strtotime($begin))->startOfDay();
        $this->end = Carbon::createFromTimestamp(strtotime($end))->endOfDay();

        if ($this->end->timestamp < $this->begin->timestamp) {
            header('content-type:application/json;charset=utf8');
            echo '{"success": false, "msg": "时间区间不正确"}';
            exit;
        }
    }

    public function getHeadline(Request $request, $userId = null)
    {
        $resp = [
            'orders' => 0,
            'reply_ratio' => 0,
            'messages' => 0,
            'answer_ratio' => 0,
            'first_response_avg' => '0秒',
            'response_avg' => '0秒',
            'session_avg' => '0秒',
            'absolute_ratio' => 0,
            'relative_ratio' => 0,
            'from' => json_decode('{}'),
            'evaluate' => [
                Evaluation::LEVEL_GOOD => 0,
                Evaluation::LEVEL_BAD => 0,
                Evaluation::LEVEL_GENERAL => 0,
                'UNEVALUATED' => 0
            ],
            'first_responses' => [0, 0, 0, 0, 0, 0, 0],
            'responses' => [0, 0, 0, 0, 0, 0, 0],
            'sessions' => [0, 0, 0, 0, 0, 0, 0],
            'categories' => [],
            'absolute_ratio' => 0,
            'relative_ratio' => 0
        ];

        $team = $request->user()->team;
        $handler = Stats::where('created_at', '>', $this->begin)
            ->where('created_at', '<', $this->end);

        if (CustomerManage::isManager($team->id)) {
            $teamIds = CustomerManage::getCustomerIds();
            $handler->whereIn('team_id', $teamIds);
        } else {
            $handler->where('team_id', $team->id);
        }

        if ($userId) {
            $handler->where('user_id', intval($userId));
        }

        $stats = $handler->get()->toArray();

        $source = [];

        // 合并每天的统计数据
        foreach ($stats as $stat) {
            foreach ($stat as $key => $item) {
                if (in_array($key, ['from', 'categories', 'evaluate', 'contact_hour', 'agent_hour', 'replied_hour', 'unreplied_hour'])) {
                    foreach ($item as $k => $v) {
                        if (isset($source[$key][$k])) {
                            $source[$key][$k] += $v;
                        } else {
                            $source[$key][$k] = $v;
                        }
                    }
                } elseif (in_array($key, ['first_responses', 'sessions', 'responses'])) {
                    if (!isset($source[$key])) {
                        $source[$key] = $item;
                    } else {
                        foreach ($item as $i => $v) {
                            $source[$key][$i]  += $v;
                        }
                    }
                } elseif (is_integer($item)) {
                    if (isset($source[$key])) {
                        $source[$key] += $item;
                    } else {
                        $source[$key] = $item;
                    }
                }
            }
        }

        $resp = array_merge($resp, array_only($source, ['orders', 'messages', 'categories', 'from', 'evaluate']));
        if (!empty($source['orders'])) {
            $resp['session_avg'] = format_time($source['session'] / $source['orders']);
            $evaluate = array_only($resp['evaluate'], [Evaluation::LEVEL_GOOD, Evaluation::LEVEL_BAD, Evaluation::LEVEL_GENERAL]);
            if ($sum = array_sum($evaluate)) {
                $resp['evaluate']['UNEVALUATED'] = $resp['orders'] - $sum;
                $resp['absolute_ratio'] = $source['evaluate'][Evaluation::LEVEL_GOOD] / $source['orders'] * 100;
                $resp['relative_ratio'] = $source['evaluate'][Evaluation::LEVEL_GOOD] / $sum * 100;
            }
        }



        if (!empty($source['replies'])) {
            $resp['reply_ratio'] = $source['replied'] / $source['orders'] * 100;
            $resp['answer_ratio'] = $source['replies'] / $source['asks'] * 100;
        }

        if (!empty($source['replied']))  {
            $resp['first_response_avg'] = format_time($source['first_response'] / $source['replied']);
            $resp['response_avg'] = format_time($source['response'] / $source['replied']);
        }

        // 响应时间
        $keys = ['first_responses', 'responses', 'sessions'];
        foreach ($keys as $key) {
            if (isset($source[$key])) {
                $sum = array_sum($source[$key]);
                $resp[$key] = array_map(function($num) use ($sum) {
                    return $sum ? ($num / $sum * 100) : 0;
                }, $source[$key]);
            }
        }

        $firstMessage = Message::where('package.team_id', $team->id)->orderBy('_id', 'asc')->first();
        $begin = $this->begin->timestamp;
        if ($firstMessage) {
            $firstTime = (string)$firstMessage->created_at / 1000;
            if ($this->begin->timestamp < $firstTime) {
                $begin = $firstTime;
            }
        }


        // 当天数据以小时 其他数据以每天
        $days = intval(($this->end->timestamp - $begin) / 24 / 3600);
        if (!$days) {
            for ($i = 0; $i < 24; $i++) {
                $time = $this->begin->timestamp + (($i + 1) * 3600);
                $hour = date('H', $time);
                $key = ($hour === '00' ? '24' : $hour) . ':00';
                $resp['key'][] = $key;
                $resp['message']['contact'][$i] = 0;
                $resp['message']['agent'][$i] = 0;
                $resp['order']['replied'][$i] = 0;
                $resp['order']['unreplied'][$i] = 0;

                if (isset($source['contact_hour'][$key])) {
                    $resp['message']['contact'][$i] = $source['contact_hour'][$key];
                }
                if (isset($source['agent_hour'][$key])) {
                    $resp['message']['agent'][$i] = $source['agent_hour'][$key];
                }
                if (isset($source['replied_hour'][$key])) {
                    $resp['order']['replied'][$i] = $source['replied_hour'][$key];
                }
                if (isset($source['unreplied_hour'][$key])) {
                    $resp['order']['unreplied'][$i] = $source['unreplied_hour'][$key];
                }
            }
        } else {
            for ($i = 0; $i < $days; $i++) {
                $time = $begin + ($i * 24 * 3600);
                if ($days > 365) {
                    $resp['key'][] = date('y/m/d', $time);
                } else {
                    $resp['key'][] = date('m/d', $time);
                }
                $resp['message']['contact'][$i] = 0;
                $resp['message']['agent'][$i] = 0;
                $resp['order']['replied'][$i] = 0;
                $resp['order']['unreplied'][$i] = 0;
                foreach ($stats as $stat) {
                    if ($stat['date'] == date('Y-m-d', $time)) {
                        $resp['message']['contact'][$i] += $stat['asks'];
                        $resp['message']['agent'][$i] += $stat['replies'];
                        $resp['order']['replied'][$i] += $stat['replied'];
                        $resp['order']['unreplied'][$i] += $stat['orders'] - $stat['replied'];
                    }
                }
            }
        }



        $evaluate = [];
        foreach ($resp['evaluate'] as $key => $val) {
            $evaluate[strtolower($key)] = $val;
        }
        $resp['evaluate'] = $evaluate;
        $from = [];
        foreach ($resp['from'] as $key => $val) {
            $from[strtolower($key)] = $val;
        }
        $resp['from'] = $from;
        
        return $this->responseJson($this->toFloat($resp));
    }

    public function toFloat($array)
    {
        return array_map(function ($num) {
            if (is_array($num)) {
                return $this->toFloat($num);
            }
            if (is_float($num)) {
                return floatval(number_format($num, 2, '.', ''));
            }
            return $num;
        }, $array);
    }

    public function getAgenttiming(Request $request)
    {

        if ($userId = $request->get('user_id')) {
            $resp = AgentTiming::where('user_id', intval($userId))
                ->where('created_at', '>=', $this->begin)
                ->where('created_at', '<=', $this->end)
                ->get();

            foreach ($resp as $item) {
                $item->first_online_time = date('Y-m-d H:i:s', $item->first_online_time);
                $item->last_offline_time = date('Y-m-d H:i:s', $item->last_offline_time);
                $item->online_time = format_time($item->online_time);
            }
            
            return $this->responseJson($resp);
        }

        return $this->responseJsonError('缺少 user_id 参数', 403);
    }

    /**
     * 访客统计
     * @param Request $request
     * @return mixed
     */
    public function getVisit(Request $request)
    {
        $handler = Visit::with('contact')
            ->where('created_at', '>=', $this->begin)
            ->where('created_at', '<=', $this->end)
            ->orderBy('_id', 'desc');

        if (CustomerManage::isManager($request->user()->team_id)) {
            $handler->whereIn('team_id', CustomerManage::getCustomerIds());
        } else {
            $handler->where('team_id', $request->user()->team_id);
        }

        if (isset($_GET['export'])) {
            $rows[0] = ['访客', '来源', 'ip', '停留时长', '访问页面数'];
            $items = $handler->get();
            foreach ($items as $i => $item) {
                $rows[$i+1] = [$item->contact_name, $item->referrer, $item->ip, format_time($item->second), $item->times];
            }
            $this->export('访客统计', $rows);
        }

        return $this->listToPage($handler, function ($items) {
            foreach ($items as $item) {
                $item->second = format_time(max($item->updated_at->timestamp - $item->created_at->timestamp, 1));
                $item->source = parse_source($item->referrer);
            }
        });
    }

    /**
     * 客服统计
     * @param $request
     * @param $id
     */
    public function getAgent(Request $request)
    {
        $agents = User::where('team_id', $request->user()->team_id)
            ->orderBy('id')
            ->get();

        $handler = Stats::where('created_at', '>=', $this->begin)
            ->where('created_at', '<=', $this->end);

        if (CustomerManage::isManager($request->user()->team_id)) {
            $teamIds = CustomerManage::getCustomerIds();
            $stats = $handler->whereIn('team_id', $teamIds)->get();
        } else {
            $stats = $handler->where('team_id', $request->user()->team_id)->get();
        }

        foreach ($agents as $agent) {
            $agent->order_count = 0;
            $agent->message_count = 0;
            $agent->time = 0;
            foreach ($stats as $stat) {
                if ($stat->user_id == $agent->id) {
                    $agent->order_count += $stat->orders;
                    $agent->message_count += $stat->messages;
                    $agent->time += $stat->session;
                }
            }
            $agent->time = format_time($agent->time);
        }

        return $this->responseJson(['data' => $agents]);
    }

    /**
     * 工单统计
     * @param $request
     */
    public function getOrder(Request $request)
    {
        $handler = Order::with(['contact' => function ($q) {
                $q->with('tags');
            }])
            ->with('user')
            ->with('category')
            ->where('status', '<>', Order::STATUS_INIT)
            ->orderBy('updated_at', 'desc');

        if (CustomerManage::isManager($request->user()->team_id)) {
            $handler->whereIn('team_id', CustomerManage::getCustomerIds());
        } else {
            $handler->where('team_id', $request->user()->team_id);
        }

        if ($userId = $request->get('user_id')) {
            $handler->where('user_id', intval($userId));
        }

        $handler->where('updated_at', '>=', $this->begin)
            ->where('updated_at', '<=', $this->end);

        if ($status = strtoupper($request->get('status'))) {
            if (in_array($status, [Order::STATUS_CLOSED, Order::STATUS_OPEN, Order::STATUS_SLEEP])) {
                $handler->where('status', $status);
            }
        }

        return $this->listToPage($handler);
    }

    /**
     * 客服评价
     */
    public function getEvaluation(Request $request)
    {
        $handler = Evaluation::with(['user', 'contact'])
            ->orderBy('created_at', 'desc');

        if (CustomerManage::isManager($request->user()->team_id)) {
            $handler->whereIn('team_id', CustomerManage::getCustomerIds());
        } else {
            $handler->where('team_id', $request->user()->team_id);
        }

        if ($userId = $request->get('user_id')) {
            $handler->where('user_id', intval($userId));
        }

        $handler->where('created_at', '>', $this->begin)
            ->where('created_at', '<', $this->end);

        if ($levels = $request->get('level')) {
            $handler->whereIn('level', $levels);
        }

        if ($filters = $request->get('filter')) {
            $fillable = $handler->getModel()->getFillable();
            if (is_array($filters)) {
                foreach ($filters as $filter) {
                    if (in_array($filter, $fillable)) {
                        $handler = $handler->where($filter, '<>', '');
                    }
                }
            }
        }

        return $this->listToPage($handler, function ($lists) {
            foreach ($lists as $item) {
                $item->level_text = $item->levelToText();
            }
        });
    }

    /**
     *  导出统计数据
     */
    private function export($title, $rows)
    {
        Excel::create($title, function ($excel) use ($title, $rows) {
            $excel->sheet($title, function ($sheet) use ($rows) {
                $sheet->rows($rows);
            });
        })->export('xls');
    }
}
