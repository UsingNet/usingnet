<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;

class Web extends Model
{
    const TYPE_ORDER =  'ORDER';
    const TYPE_IM = 'IM';
    const TYPE_IM_LM = 'IM-LM';

    protected $table = 'setting_web';
    protected $fillable = ['type', 'name', 'logo', 'team_id', 'title_bg_color', 'title_txt_color', 'button_bg_color', 'button_txt_color',
        'message_left_bg_color', 'message_left_font_color', 'message_right_bg_color', 'message_right_font_color',
        'input_placeholder', 'direction', 'page_distance', 'icon_shape', 'customer_icon', 'page_bottom_distance', 'welcome', 'order',
        'invite', 'invite_text', 'invite_wait_time', 'invite_img', 'invite_closed', 'display_agent_group', 'welcome_type'];

    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer',
        'invite' => 'integer',
        'invite_closed' => 'integer'
    ];

    public function getOrderAttribute($json)
    {
        $arr = @json_decode($json);
        return $arr ? $arr : [];
    }

    public function setOrderAttribute($arr)
    {
        $this->attributes['order']  = json_encode($arr);
    }
}
