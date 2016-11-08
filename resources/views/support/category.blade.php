@extends('support.layout')

@section('title', $category->title)

@section('content')
    @include('support.include.bread')
    <div id="content">
        <div class="left-area">
            <div class="article-area">
                <h1>{{ $category->title }}</h1>
                <div>
                    @foreach ($category->children as $child)
                        <div class="article-list">
                            <h3><a href="{{ asset('list/' . $child->_id) }}">{{ $child->title }}</a></h3>
                            <ul>
                                @if (isset($child->articles))
                                    @foreach ($child->articles as $article)
                                        <li><a href="{{ asset('article/' . $article->_id) }}">{{ $article->title }}</a></li>
                                    @endforeach
                                @endif
                            </ul>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>

        <div class="right-area">
            <div class="article-area">
                <h3>最多浏览</h3>
                <ul>
                    @foreach($hots as $article)
                        <li><a href="{{ asset('article/' . $article->_id) }}">{{ $article->title }}</a></li>
                    @endforeach
                </ul>
            </div>
        </div>
    </div>
@endsection

