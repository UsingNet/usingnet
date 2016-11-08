<?php

namespace App\Console\Commands;

use App\Library\Curl;
use App\Models\Order;
use App\Services\Messanger;
use Config;
use App\Library\Syslog;
use App\Models\Contact;
use App\Models\Message;
use App\Models\Team;
use Gibson\Wechat;
use Illuminate\Console\Command;
use App\Models\Setting\Wechat as Account;

class SendWechat extends Command
{
    const API_GET_INDUSTRY = 'https://api.weixin.qq.com/cgi-bin/template/get_industry?access_token=';
    const API_ADD_INDUSTRY = 'https://api.weixin.qq.com/cgi-bin/template/api_set_industry?access_token=';
    const API_ADD_TEMPLATE = 'https://api.weixin.qq.com/cgi-bin/template/api_add_template?access_token=';

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'SendWechat {data}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $industries = ['', '互联网/电子商务', 'IT软件与服务', 'IT硬件与设备', '电子技术', '通信与运营商', '网络游戏', '银行',
            '基金|理财|信托', '保险', '餐饮', '酒店', '旅游', '快递', '物流', '仓储', '培训', '院校', '学术科研', '交警', '博物馆', '公共事业|非盈利机构',
            '医药医疗', '护理美容', '保健与卫生', '汽车相关', '摩托车相关', '火车相关', '飞机相关', '建筑', '物业', '消费品', '法律', '会展', '中介服务', '认证',
            '审计', '传媒', '娱乐休闲', '印刷', '其它'];

        $data = json_decode($this->argument('data'), true);
        $order = Order::find($data['package']['order_id']);
        $account = Account::find($order->contact->wechat_id);
        $staff = new Wechat\Staff($account->getAccessToken());
        $media = new Wechat\Media($account->getAccessToken());
        $message = $data['body'];
        Syslog::logger('CONSOLE')->addDebug('SEND_WECHAT',$data);
        $reg = \Config::get('regular.image');

        if (preg_match($reg, $message, $match)) {
            $pair = explode('/', $match[0]);
            $path = storage_path(end($pair));
            file_put_contents($path, file_get_contents($match[0]));
            $image = $media->image($path);
            @unlink($path);
            $message = \Overtrue\Wechat\Message::make('image')->media($image['media_id']);
        }

        if (isset($data['package']['wiki'])) {
            $wiki = $data['package']['wiki'];
            $message =  \Overtrue\Wechat\Message::make('news') ->items(function () use ($wiki) {
                return [
                    \Overtrue\Wechat\Message::make('news_item')
                        ->title($wiki['title'])
                        ->description($wiki['desc'])
                        ->url($wiki['url'])
                        ->picUrl($wiki['img'])
                ];
            });
        }

        $lastMessage = Message::where('package.contact.id', $order->contact_id)
            ->where('type', Message::TYPE_WECHAT)
            ->orderBy('_id', 'desc')
            ->first();

        // 发送模板消息

        try {
            if (!$lastMessage || (time() - strval($lastMessage->created_at) / 1000 > 48 * 3600)) {
                $team = Team::find($order->team_id);
                $contact = $order->contact;
                if (!$account->use_template_message) {
                    //throw new \Exception('超过 48 小时不能回复');
                }

                if (!$account->template_id) {
                    $token = $account->getAccessToken();
                    $url = self::API_GET_INDUSTRY . $token;
                    $json = Curl::to($url)->get();
                    $industry = json_decode($json, true);
                    $primary = 2;
                    if (isset($industry['primary_industry'])) {
                        $primary  = array_search($industry['primary_industry']['second_class'], $industries);
                    }
                    $params = json_encode([
                        'industry_id1' => $primary,
                        'industry_id2' => 1
                    ]);

                    $url = self::API_ADD_INDUSTRY . $token;
                    Curl::to($url)->withData($params)->post();
                    $url = self::API_ADD_TEMPLATE . $token;

                    $params = json_encode([
                        'template_id_short' => 'OPENTM401096672'
                    ]);

                    $json = Curl::to($url)->withData($params)->post();
                    $response = json_decode($json, true);
                    if (isset($response['template_id'])) {
                        $account->update(['template_id' => $response['template_id']]);
                    } else {
                        throw new \Exception('公众号设置模板错误, 请联系管理员');
                    }
                }

                $url = \Config::get('web.im') . sprintf('?tid=%s&track_id=%s&page_id=%s', $team->token, $contact->track_id, microtime(true));
                $notice = new Wechat\Notice($account->getAccessToken());
                $message = [
                    'first' => '您的工单有了新的消息',
                    'keyword1' => '微信',
                    'keyword2' => $data['body'],
                    'remark' => '您可以点击消息与客服进行对话，也可以直接在微信回复'
                ];

                try {
                    $notice->send($order->contact->openid, $account->template_id, $message, $url);
                } catch (\Exception $e) {
                    Syslog::logger('MESSAGE')->addCritical('SEND_WECHAT_NOTICE', [$data, $e->getMessage()]);
                }
            } else {
                $staff->send($message)->to($order->contact->openid);
            }
        } catch (\Exception $e) {
            Messanger::system([
                'from' => $order->from,
                'to' => $order->to,
                'body' => $e->getMessage(),
                'direction' => Message::DIRECTION_RECEIVE,
                'package' => [
                    'order_id' => $order->id,
                    'team_id' => $order->team_id
                ]
            ]);
        }
    }
}
