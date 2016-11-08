@extends('support.layout')

@section('title', '提交问题')

@section('content')

    @include('support.include.bread', ['breadFirst' => '提交问题'])

    <div id="content" class="submit">
        <div class="form-area">
            <form class="pure-form pure-form-stacked" method="post" action="{{ asset('submit') }}">
                <fieldset>
                    <div class="contact_info">
                        <div class="pure-control-group">
                            <label for="lm_email">电子邮件</label>
                            <input required="required" type="email" name="email" id="lm_email" placeholder="name@example.com"/>
                        </div>

                        <div class="pure-control-group">
                            <label for="lm_title">问题标题</label>
                            <input class="pure-u-md-1-2" required="required" type="text" name="phone" id="lm_phone" />
                        </div>
                    </div>
                    <label for="lm_message">问题描述</label>
                    <textarea required class="pure-input-2-3" name="body" id="lm_message" placeholder="有什么可以帮助您"></textarea>
                    <div class="pure-control-group">
                        <label for="lm_category">分类</label>
                        <select required name="" id="">
                            <option value="">-</option>
                            @foreach ($categories as $category)
                                <option value="{{ $category->_id }}">{{ $category->title }}</option>
                            @endforeach
                        </select>
                    </div>
                    <input class="pure-button pure-button-primary" type="submit" class="submit" value="提交" />
                </fieldset>
            </form>
        </div>
    </div>
@endsection
