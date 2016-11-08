<div id="main-track">
    <div class="bread-nav">
        <a href="/">首页</a>
        @if (isset($breadFirst))
            &gt;
            @if (is_array($breadFirst))
                <a href="{{ $breadFirst['url'] }}">{{ $breadFirst['name'] }}</a>
            @else
                {{ $breadFirst }}
            @endif
        @endif

        @if (isset($breadSecond))
            &gt;
            @if (is_array($breadSecond))
                <a href="{{ $breadSecond['url'] }}">{{ $breadSecond['name'] }}</a>
            @else
                {{ $breadSecond  }}
            @endif
        @endif
        <form action="{{ asset('search') }}" class="pure-form">
            <input type="text" class="pure-input-rounded" placeholder="搜索" name="q"  value="@if (isset($q)) {{ $q }} @endif"/>
            <input type="submit" class="button-xsmall pure-button pure-button-primary" value="搜索" />
        </form>
    </div>
</div>