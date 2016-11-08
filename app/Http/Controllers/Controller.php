<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Input;

abstract class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    protected function responseJson($data = null, $code = 200)
    {
        if (!is_array($data)) {
            $data = ['data' => is_object($data) ? $data->toArray() : $data];
        }

        return response(json_encode(array_merge(['success'=> true, 'code' => $code], $data)), 200)
            ->header('Content-Type', 'application/json');
    }

    protected function responseJsonError($msg, $code, $data = null)
    {
        return response(json_encode(array('success'=> false, 'code' => $code, 'msg'=>$msg,'data'=>$data)), 200)
            ->header('Content-Type', 'application/json');
    }

    protected function listToPage($list, \Closure $callback = null)
    {
        $fillables = array_merge($list->getModel()->getFillable(), ['_id', 'id', 'created_at', 'updated_at']);

        if ($sorts = Input::get('sort')) {
            $sorts = json_decode($sorts, true);
            if (!empty($sorts)) {
                $this->getExtJsSort($list, $sorts, $fillables);
            }
        }

        if ($filters = Input::get('filter')) {
            $filters = @json_decode($filters, true);
            if (!empty($filters)) {
                $this->getExtJsFilter($list, $filters, $fillables);
            }
        }

        $limit = intval(Input::get('limit') ? Input::get('limit') : 20);
        $paginated = $list->paginate($limit);

        // 页数大于最大页返回最后一夜
        $page = \Input::get('page');
        $skip = ($paginated->lastPage() - 1) * $limit;
        $items = $paginated->lastPage() < $page ? $list->skip($skip)->take($limit)->get() : $paginated->items();

        if ($callback) {
            $callback($items);
        }

        /*
        foreach ($items as &$item) {
            $item = $item->toArray();
        }
        */

        return $this->responseJson([
            'data' => $items,
            'total' => $paginated->total(),
            'currentPage' => $paginated->currentPage(),
            'perPage' => $paginated->perPage()
        ]);
    }

    private function getExtJsFilter($hander, $filters, $fillables)
    {
        foreach ($filters as $filter) {
            if (in_array($filter['property'], $fillables)) {
                if (isset($filter['operator'])) {
                    $operators = ['gt' => '>', 'gte' => '>=', 'lt' => '<', 'lte' => '<=', 'in' => 'in', 'eq' => '=', 'neq' => '<>'];
                    $keys = array_keys($operators);
                    if (in_array($filter['operator'], $keys)) {
                        $hander->where($filter['property'], $operators[$filter['operator']], $filter['value']);
                    }
                } else {
                    $hander->where($filter['property'], 'like', "%{$filter['value']}%");
                }
            }
        }
    }

    private function getExtJsSort($hander, $sorts, $fillables)
    {
        foreach ($sorts as $sort) {
            if (in_array($sort['property'], $fillables)) {
                $hander->orderBy($sort['property'], $sort['direction']);
            }
        }
    }
}
