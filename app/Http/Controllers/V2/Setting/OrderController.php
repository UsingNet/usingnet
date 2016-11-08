<?php

namespace App\Http\Controllers\V2\Setting;

use Illuminate\Http\Request;
use App\Models\Setting\Order;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use MongoDB\BSON\ObjectID;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $handler = Order::where('team_id', $request->user()->team_id);

        return $this->listToPage($handler);
    }

    public function store(Request $request)
    {
        $data =$request->only('title', 'items');
        $data['team_id'] = $request->user()->team_id;
        $validator = $this->validator($data);


        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $order = Order::create($data);

        return $this->responseJson($order);
    }

    public function update(Request $request, $id)
    {
        $order = Order::where(['_id' => $id])->where('team_id', $request->user()->team_id)->first();
        if (!$order) {
            return $this->responseJsonError('工单设置不存在', 404);
        }

        $data = $request->all();
        $data['_id'] = $order->_id;
        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();

            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $order->fill($data);
        $order->save();

        return $this->responseJson($order);
    }

    public function destroy(Request $request, $id)
    {
        $order = Order::where('_id', $id)->where('team_id', $request->user()->team_id)->first();
        if (!$order) {
            return $this->responseJsonError('工单设置不存在', 404);
        }

        return $this->responseJson($order->delete());
    }

    public function validator(array &$data)
    {
        if (!empty($data['items'])) {
            $items = [];
            $defaultItem = [
                'placeholder' => '请填写您遇到的问题',
                'type' => 'textarea'
            ];

            if (!is_array($data['items'])) $data['items'] = [$defaultItem];

            foreach ($data['items'] as $item) {
                if (!isset($item['type']) || !in_array($item['type'], ['text', 'textarea'])) {
                    $item['type'] = 'textarea';
                }
                $items[] = array_only(array_merge($defaultItem, $item), ['placeholder', 'type']);
            }
            $data['items'] = $items;
        }

        return Validator::make($data, [
            'title' => 'required_without:_id|min:5|max:50',
            'items' => 'required_without:_id'
        ]);
    }
}