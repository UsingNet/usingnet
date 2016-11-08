<?php

namespace App\Http\Controllers\Api\Wechat;

use App\Http\Controllers\Controller;
use App\Models\Setting\Wechat;
use Gibson\Wechat\Menu;
use Gibson\Wechat\MenuItem;
use Gibson\Wechat\AccessToken;
use Illuminate\Http\Request;

class ManageController extends Controller
{
    public function __construct(Request $request)
    {
        $account = Wechat::where('team_id', $request->user()->team_id)->first();
        $accessToken = new AccessToken($account->app_id, $account->refresh_token);
        $this->access_token = $accessToken->getToken();
    }

    public function getMenu(Request $request)
    {
        $menuService = new Menu($this->access_token);
        try {
            $menus = $menuService->get();
            return $this->responseJson($menus);
        } catch (\Exception $e) {
            return $this->responseJsonError($e->getMessage(), $e->getCode());
        }
    }

    public function postMenu(Request $request)
    {
        $menuService = new Menu($this->access_token);
        $menus = $request->get('menus');
        $target = [];

        if (!is_array($menus)) {
            return $this->responseJsonError('menus 必须为数组', 403);
        }


        foreach ($menus as $menu) {
            //$item = new MenuItem($menu['name'], $menu['type'], $menu['key']);
            $item = new MenuItem('测试', 'click','click'); 
            // 子菜单
            if (!empty($menu['buttons'])) {
                $buttons = [];
                foreach ($menu['buttons'] as $button) {
                    $buttons[] = new MenuItem($button['name'], $button['type'], $button['key']);
                }

                $item->buttons($buttons);
            }
            $target[] = $item;
        }

        try {
            $menuService->set($target);
            return $this->responseJson('创建成功');
        } catch (\Exception $e) {
            return $this->responseJsonError($e->getMessage(), $e->getCode());
        }
    }
}
