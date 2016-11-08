@extends('support.layout')

@section('title', '帮助中心')


@section('content')
    @include('support.include.search')
    <div id="content">
        <div class="left-area">
            <div class="article-area">
                @foreach ($categories as $category)
                    <div>
                        <h3><a href="{{ asset('category/' . $category->_id) }}">{{ $category->title }}</a></h3>
                        @if (isset($category->children))
                            @foreach ($category->children as $child)
                                <div class="article-list">
                                    <h4><a href="{{ asset('list/' . $child->_id) }}">{{ $child->title }}</a></h4>
                                    <ul>
                                        @if (isset($child->articles))
                                            @foreach ($child->articles as $article)
                                                <li><a href="{{ asset('article/' . $article->_id) }}">{{ $article->title }}</a></li>
                                            @endforeach
                                        @endif
                                    </ul>
                                </div>
                            @endforeach
                        @endif
                    </div>
                    <div class="clear"></div>
                @endforeach

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

