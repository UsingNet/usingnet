<?php

namespace App\Http\Controllers\V2;

use App\Models\Permission;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $lists = Permission::getAll();
        $exists = Permission::where(['team_id' => $request->user()->team_id])->lists('slug')->toArray();
        foreach ($lists as &$list) {
            if (in_array($list['slug'], $exists)) {
                $list['used'] = true;
            }
        }

        return $this->responseJson(['data' => $lists]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $ids = $request->get('ids');
        $teamId = $request->user()->team_id;
        $lists = Permission::getAll();
        $params = [];
        $otherSlugs = [];

        if (!$ids) {
            Permission::where('team_id', $teamId)->delete();
        } else {
            foreach ($lists as $item) {
                if (in_array($item['id'], $ids)) {
                    $params[] = array_only($item, ['name', 'slug']);
                } else {
                    $otherSlugs[] = $item['slug'];
                }
            }
            Permission::where('team_id', $teamId)->whereIn('slug', $otherSlugs)->delete();
            foreach ($params as $param) {
                $param['team_id'] = $teamId;
                Permission::firstOrCreate($param);
            }
        }

        return $this->responseJson('ok');
    }
}
