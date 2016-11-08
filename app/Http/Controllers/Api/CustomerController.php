<?php

namespace App\Http\Controllers\Api;

use App\Models\Contact;
use App\Models\CustomerManage;
use App\Models\Setting\Web;
use App\Models\Team;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class CustomerController extends Controller
{
    public function getIndex(Request $request)
    {
        if (!CustomerManage::isManager($request->user()->team_id))  {
            return view('errors.error', ['title' => '非管理员', 'desc' => '']);
        }

        $team = null;
        $contactId = $request->get('contact_id');
        $contact = Contact::find($contactId);

        if ($contact) {
            $customer = CustomerManage::where('team_id', intval($contact->team_id))->with('team')->first();
        }

        return view('plugin.customer.index', compact('customer'));
    }
}
