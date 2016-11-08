@extends('support.layout')

@section('title', $category->title)

@section('content')
    @include('support.include.bread')
    <div id="content">
        <div class="left-area">
            <div class="article-area">
                <h1>{{ $category->title }}</h1>
                <div class="articles">
                    <ul>
                        @foreach ($lists as $article)
                            <li><a href="{{ asset('article/' . $article->_id) }}">{{ $article->title }}</a></li>
                        @endforeach
                    </ul>
                </div>
            </div>

            <div class="paging">
                {{ $lists->render() }}
            </div>
        </div>

        <div class="right-area">
            <div class="article-area">
                <h3>最多浏览</h3>
                <ul>

                </ul>
            </div>
        </div>
    </div>
@endsection

