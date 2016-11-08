<?php

namespace App\Http\Controllers\Api\Setting;

use App\Models\Setting\Holiday;
use Carbon\Carbon;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class HolidayController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $holiday = Holiday::where('team_id', $request->user()->team_id)->get();

        return $this->responseJson($holiday);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->only('date', 'work');
        $validator = $this->validator($data, $request->user()->team_id);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if ($data['date'] < strtotime(date('Y-m-d'))) {
            return $this->responseJsonError('不能添加过去的日期', 403);
        }

        $data['team_id'] = $request->user()->team_id;
        $holiday  = Holiday::create($data);

        return $this->responseJson($holiday);
    }

    /**
     * 修改假期
     * @param $request
     * @param $id
     * @return josn
     */
    public function update(Request $request, $id)
    {
        $holiday = Holiday::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if (!$holiday) {
            return $this->responseJsonError('假期不存在', 403);
        }

        $data = array_filter($request->only('date', 'work', 'id'));
        $validator = $this->validator($data, $holiday->team_id);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if (!empty($data['date']) && date('d', $data['date']) < date('d', time())) {
            return $this->responseJsonError('不能添加过去的日期', 403);
        }

        $holiday->update($data);
        $holiday->save();

        return $this->responseJson($holiday);
    }

    /**
     * 删除假期
     * @param $request
     * @param $id
     * @return json
     */
    public function destroy(Request $request, $id)
    {
        $holiday = Holiday::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if (!$holiday) {
            return $this->responseJsonError('假期不存在', 403);
        }

        return $this->responseJson($holiday->delete());
    }

    public function validator($data, $teamId)
    {
        return Validator::make($data, [
            'date' => 'required_without:id|unique:setting_holiday,date,NULL,id,team_id,' . $teamId,
            'work' => 'required_without:id'
        ], [
            'date.required_without' => '日期不能为空',
            'date.unique' => '该日期已经设置了',
            'work.required_without' => '工作状态不能为空',
            'date.min' => '不能添加过去的日期'
        ]);
    }
}
