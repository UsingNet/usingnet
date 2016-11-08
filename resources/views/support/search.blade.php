@extends('support.layout')

@section('title', '搜索结果')

@section('content')

    @include('support.include.bread', ['pageTitle' => '搜索'])

    <div id="content">
        <div class="search-result-list">
            @foreach ($knowledges as $knowledge)
                <div class="search-result">
                    <div class="title"><a href="/article/{{ $knowledge->_id }}">{{ $knowledge->title }}</a>
                        <span class="datetime">{{ date('Y年m月d日', strtotime($knowledge->created_at)) }}</span></div>
                    <div class="description">
                        <p>{{ mb_substr(strip_tags($knowledge->message), 0, 100) }}</p>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="paging">
            {!! $knowledges->render() !!}
        </div>

        @if ($knowledges->isEmpty())
            <p>没有找到　<strong>{{ $q }}</strong>　相关的问题</p>
        @endif
    </div>

@endsection