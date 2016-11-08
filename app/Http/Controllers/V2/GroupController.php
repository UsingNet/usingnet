<?php

namespace App\Http\Controllers\V2;

use App\Models\Team;
use Validator;
use App\Models\Group;
use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    /**
     * 成员列表
     * @param Request $request
     * @return mixed
     */
    public function index(Request $request)
    {
        $handler = Group::with('users')
            ->where('team_id', $request->user()->team_id);

        return $this->listToPage($handler);
    }

    /**
     * 添加分组
     * @param Request $request
     * @return mixed
     */
    public function store(Request $request)
    {
        $data = $request->only('name');
        $data['team_id'] = $request->user()->team_id;
        $validator = $this->validator($data, $request->user()->team_id);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $group = Group::create($data);

        if ($users = $request->get('users')) {
            if (is_array($users) && !empty($users)) {
                $users = User::whereIn('id', $users)->get();
                foreach ($users as $user) {
                    $group->users()->save($user);
                }
            }
        }

        Team::clearTeamInfoCache($request->user()->team);

        return $this->responseJson($group);
    }

    /**
     * 修改用户
     * @param Request $request
     * @param $id
     * @return mixed
     */
    public function update(Request $request, $id)
    {
        $group = Group::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        if (!$group) {
            return $this->responseJsonError('分组不存在', 404);
        }

        $data = $request->only('name');
        $validator = $this->validator($data, $request->user()->team_id, $id);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if ($users = $request->get('users')) {
            if (is_array($users) && !empty($users)) {
                $users = User::whereIn('id', $users)->get();
                foreach($group->users as $user) {
                    $group->users()->detach($user);
                }
                foreach ($users as $user) {
                    $group->users()->save($user);
                }
            }
        }

        $group->fill($data);
        $group->save();

        Team::clearTeamInfoCache($request->user()->team);

        return $this->responseJson($group);
    }

    public function postOperator(Request $request)
    {
        $data = $request->only('user_id', 'group_id', 'type');
        $teamId = $request->user()->team_id;
        $validator = Validator::make($data, [
            'group_id'  => 'exists:group,id,team_id,' . $teamId,
        ], [
            'group_id.exists' => '分组不存在'
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError($errors, 403);
        }


        $users = User::whereIn('id', $data['user_id'])->get();
        $group = Group::find($data['group_id']);

        foreach($group->users as $user) {
            $group->users()->detach($user);
        }

        foreach ($users as $user) {
            $group->users()->save($user);
        }

        return $this->responseJson('ok');
    }

    /**
     * 删除用户
     * @param Request $request
     * @param $id
     * @return mixed
     */
    public function destroy(Request $request, $id)
    {
        $group = Group::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        if (!$group) {
            return $this->responseJsonError('分组不存在', 404);
        }

        \DB::table('user_group')->where('group_id', $id)->delete();
        return $this->responseJson($group->delete());
    }

    public function validator($data, $teamId, $id = NULL)
    {
        return Validator::make($data, [
            'name' => 'required|max:10|unique:group,name,' . $id . ',id,team_id,' . $teamId
        ], [
            'name.required' => '名字不能为空',
            'name.max' => '名字不能大于 10 个字符',
            'name.unique' => '名字已存在'
        ]);
    }
}
