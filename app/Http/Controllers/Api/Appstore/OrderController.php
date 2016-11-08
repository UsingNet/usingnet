<?php

namespace App\Http\Controllers\Api\Appstore;

use Config;
use App\Http\Controllers\Controller;
use App\Models\Appstore;
use App\Models\Appstore\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function __construct(Request $request)
    {
        if (!$request->user()) {
            $this->middleware('auth', ['except' => 'getSelect']);
        }
    }

    public function getIndex(Request $request)
    {
        $config = $this->getConfig($request);
        $q = $request->get('q');
        $handler = Order::where('team_id', intval($request->user()->team_id))
            ->orderBy('_id', 'desc');

        if ($q) {
            $handler->where(function($query) use ($q) {
                $query->where('number', $q)
                    ->orWhere('name', 'like', '%'.$q.'%')
                    ->orWhere('phone', 'like', '%'.$q.'%');
            });
        }

        $orders = $handler->paginate(20);
        $selectUrl = 'https://'. $request->getHost() . '/appstore/order/select/'. $request->user()->team_id;

        return view('appstore.order.index', compact('orders', 'q', 'selectUrl', 'config'));
    }

    public function postSubmit(Request $request)
    {
        $team = $request->user()->team;
        $params = $request->only('id', 'name', 'phone', 'number', 'title', 'action', 'status');

        $validator = Validator::make($params, [
            'name' => 'required',
            'phone' => 'required',
            'title' => 'required',
            'action' => 'required',
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $params['action'] = strtoupper($params['action']);
        $params['team_id'] = intval($team->id);

        if (!$params['id']) {
            if (!$params['number']) {
                $params['number'] = Order::genNumber($team->id);
            }

            if (Order::where('number', $params['number'])->where('team_id', intval($team->id))->first()) {
                return $this->responseJsonError('订单号已存在', 403);
            }
            $params['status'] = [[
                'time' => time(),
                'status' => $params['status']
            ]];
            Order::create($params);
        } else {
            $order = Order::where('team_id', intval($team->id))
                ->where('_id', $params['id'])
                ->first();
            if (!$order) {
                return $this->responseJsonError('工单不存在', 404);
            }
            $status = $order->status;
            if ($params['status']) {
                $status[] = [
                    'time' => time(),
                    'status' => $params['status']
                ];
                $order->status = $status;
            }
            unset($params['status']);
            unset($params['number']);

            $order->fill($params);
            $order->save();
        }

        return $this->responseJson('ok');
    }

    public function getShow(Request $request, $id)
    {
        $order = Order::where('team_id', intval($request->user()->team_id))
            ->where('_id', $id)
            ->first();

        if (!$order) {
            return $this->responseJsonError('订单不存在', 403);
        }

        $order = $order->toArray();
        foreach ($order['status'] as &$status) {
            $status['time'] = date('Y-m-d H:i:s', $status['time']);
        }

        return $this->responseJson($order);
    }

    public function getSelect(Request $request, $tid = null)
    {
        if (!$tid) abort(404);
        $config = $this->getConfig($request);
        $q = $request->get('q');
        $orders = Order::where('team_id', intval($tid))
            ->where(function($query) use ($q) {
                $query->where('_id', $q)
                    ->orWhere('number', $q)
                    ->orWhere('phone', $q);
            })->get();

        foreach ($orders as $order) {
            $status = $order->status;
            usort($status, function($a, $b) {
                return $a['time'] < $b['time'];
            });
            $order->status = $status;
        }

        return view('appstore.order.select', compact('config', 'q', 'orders', 'tid'));
    }

    public function getConfig($request)
    {
        $url = $request->fullUrl();
        $params = [
            'nonce' => rand(11111, 55555),
            'app_id' => Config::get('plugin.order.app_id'),
            'token' => Config::get('plugin.order.team_token'),
            'key' => Config::get('plugin.order.key'),
            'timestamp' => time(),
            'url' => $url
        ];

        $resp = request_plugin('GET', 'wechatjsticket', $params);
        $config = [];
        if (isset($resp['data'])) {
            $config = $resp['data'];
        }

        return $config;
    }
}
