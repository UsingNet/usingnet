<?php

namespace App\Http\Controllers\Api\Account;

use App\Models\Attachment;
use App\Models\Identity;
use App\Models\Veritication;
use App\Services\WechatTeam;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class IdentityController extends Controller
{
    /**
     * 用户认证信息
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        //
        $identity = Identity::where('team_id', $request->user()->team_id)->first();

        if (!$identity) {
            $identity = Identity::create(['team_id' => $request->user()->team_id]);
        }

        return $this->responseJson($identity);
    }


    /**
     * 保存认证信息
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
        $data = $request->only('company_name', 'industry', 'organization_number', 'organization_certificate',
            'tax_number', 'tax_certificate', 'license_number', 'legal_person', 'telphone', 'company_address',
            'license_certificate', 'website', 'code', 'phone');


        // 验证手机验证码
        $vertication = Veritication::where('source', $data['phone'])->orderBy('id', 'desc')->first();
        if (!$vertication || $vertication->code != $data['code']) {
            return $this->responseJsonError('手机验证码不正确', 403);
        }

        $vertication->delete();

        $data['team_id'] = $request->user()->team_id;
        $data['status'] = Identity::STATUS_CHECKING;
        $validator = $this->validator($data);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode('', $errors), 403);
        }

        $identity = Identity::firstOrCreate(['team_id' => $request->user()->team_id]);
        $identity->fill($data);
        $identity->save();

        Attachment::where('src', $data['organization_certificate'])->increment('ref');
        Attachment::where('src', $data['tax_certificate'])->increment('ref');
        Attachment::where('src', $data['license_certificate'])->increment('ref');


        WechatTeam::notice('用户提交认证信息');

        return $this->responseJson($identity);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $data = $request->all();
        $identity = Identity::where('team_id', $request->team_id)->first();
        $identity->status = Identity::STATUS_CHECKING;
        $identity->fill($data);

        if (!empty($data['organization_certificate'])) {
            Attachment::where('src', $data['organization_certificate'])->increment('ref');
            Attachment::where('src', $identity->organization_certificate)->increment('ref', -1);
        }

        if (!empty($data['tax_certificate'])) {
            Attachment::where('src', $data['tax_certificate'])->increment('ref');
            Attachment::where('src', $identity->tax_certificate)->increment('ref', -1);
        }

        if (!empty($data['license_certificate'])) {
            Attachment::where('src', $data['license_certificate'])->increment('ref');
            Attachment::where('src', $identity->license_certificate)->increment('ref', -1);
        }

        $identity->save();

        return $this->responseJson($identity);
    }


    public function validator($data)
    {
        return Validator::make($data, [
            'company_name' => 'required_without:id',
            'industry' => 'required_without:id',
            'organization_number' => 'required_without:id',
            'organization_certificate' => 'required_without:id',
            'tax_number' => 'required_without:id',
            'tax_certificate' => 'required_without:id',
            'license_number' => 'required_without:id',
            'legal_person' => 'required_without:id',
            'telphone' => 'required_without:id',
  //          'phone' => 'required_without:id|unique',
        ], [
            'company_name.required_without' => '公司名称不能为空',
            'industry.required_without' => '行业不能为空',
            'organization_number.required_without' => '组织机构号不能为空',
            'organization_certificate.required_without' => '组织机构证不能为空',
            'tax_number.required_without' => '税务登记号不能为空',
            'tax_certificate.required_without' => '税务登记证不能为空',
            'license_number.required_without' => '营业执照号码不能为空',
            'license_certificate.required_without' => '营业执照号码不能为空',
            'legal_person.required_without' => '法定代表不能为空',
            'telphone.required_without' => '电话不能为空',
        ]) ;
    }
}
