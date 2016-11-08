<?php

namespace App\Console\Commands;

use App\Models\Message\Send;
use App\Models\Admin\Notice as Model;
use App\Models\Team;
use App\Models\User;
use App\Services\Messanger;
use Illuminate\Console\Command;

class Notice extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notice';

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
        $notices = Model::where('status', Model::STATUS_INIT)->get();
        foreach ($notices as $notice) {
            if ($notice->assign[0] === 'all') {
                $teams = Team::all();
            } else {
                $teams = $notice->assign;
            }
            foreach ($teams as $team) {
                $users = User::where('team_id', $team->id)->get();
                foreach ($users as $user) {
                    Messanger::notice($user->token, $notice->content);
                }
            }

            $notice->update(['status' => Model::STATUS_SUCCESS]);
        }
    }
}
