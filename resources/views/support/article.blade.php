@extends('support.layout')

@section('title',  $article->title)

@section('content')

    @include('support.include.bread', ['pageTitle' => '文章'])

    <div id="content">
        <div class="left-area">
            <div class="main-content">
                <div class="title">
                    <h1>{{ $article->title }}</h1>
                </div>
                <div class="meta">
                   {{ $article->user->name }} 发布于 {{ date('Y年m月d日', strtotime($article->created_at)) }}
                </div>
                <div class="article">
                    {!! $article->message !!}
                </div>
            </div>
            <div class="votes">
                @if ($article->good) {{ $article->good }} 人觉得有帮助 @endif
                <a class="pure-button" href="{{ asset('good/' . $article->_id) }}">
                    <i class="fa fa-thumbs-up"></i>
                    有帮助
                </a>
            </div>
        </div>
        <div class="right-area">
            <div class="article-area">
                <h3>相关问题</h3>
                <ul>
                    @foreach ($articles as $article)
                        <li><a href="{{ asset('article/' . $article->_id) }}">{{ $article->title }}</a></li>
                    @endforeach
                </ul>
            </div>
        </div>
    </div>
@endsection
