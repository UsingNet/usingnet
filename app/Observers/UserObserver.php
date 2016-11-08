<?php

namespace App\Observers;

use App\Models\Setting\Voip;

class UserObserver
{
    public function created($user)
    {
        $user->token = strval(new \MongoDB\BSON\ObjectID());
        $user->save();

        // 申请voip 电话
        if ($user->team && $user->team->voip->status === Voip::STATUS_SUCCESS) {
            $user->createVoipAccount();
            $user->createVoipQueue();
        }
    }

    public function deleted($user)
    {
        \DB::table('user')->where('id', $user->id)
            ->update([
                'email' => new \MongoDB\BSON\ObjectID(),
                'name' => '已删除',
                'remark' => $user->email
            ]);

        if ($user->voip) {
            $user->closeVoipAccount();
            $user->delVoipQueue();
        }
    }
}