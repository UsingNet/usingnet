<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSenSmsToAllUser extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $users = \App\Models\User::where('role', \App\Models\User::ROLE_MASTER)->where('phone', '<>', '')->get();
        $content = '【优信科技】尊敬的客户，为了给您提供更优质的服务，我公司将于11月中旬进行公司业务重组。届时，我公司影楼行业服务将由子公司深圳市墨策云商务服务有限公司进行运营。墨策云将对服务套餐进行升级，优信已签约客户将由墨策云继续按原套餐提供服务。详情请咨询客户经理或致电 0755-36527862';
        foreach ($users as $user) {
            \App\Services\NewSms::sendNotice($user->phone, $content);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
