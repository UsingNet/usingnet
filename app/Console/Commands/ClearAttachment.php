<?php

namespace App\Console\Commands;

use App\Models\Team;
use App\Models\Attachment;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ClearAttachment extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clear:attachment';

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
     * 定期清理没用的附件
     *
     * @return mixed
     */
    public function handle()
    {
        $attachments = Attachment::where('ref', 0)
            ->where('created_at', '<', Carbon::createFromTimestamp(strtotime('-365 days')))
            ->get();

        $disk = Storage::disk('qiniu');
        foreach ($attachments as $attachment) {
            $team = Team::where('id', $attachment->team_id)->with('plan')->first();
            if ($attachment->format == Attachment::FORMAT_MESSAGE) {
                if (time() - strtotime($attachment->created_at) > $team->plan->save_message_time * 3600) {
                    $pair = explode('/', $attachment->src);
                    try {
                        $attachment->delete();
                        $disk->delete(end($pair));
                    } catch (\Exception $e) {}
                }
            } else if ($attachment->format == Attachment::FORMAT_CERTIFICATE) {
                $grid = \DB::connection('mongodb')->getGridFS();
                $grid->delete(new \MongoDB\BSON\ObjectID($attachment->src));
                $attachment->delete();
            } else {
                $pair = explode('/', $attachment->src);
                try {
                    $attachment->delete();
                    $disk->delete(end($pair));
                } catch (\Exception $e) {}
            }
        }
    }
}
