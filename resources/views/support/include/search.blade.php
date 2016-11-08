<div id="main-search">
    <div class="search-inner">
        <form class="pure-form" action="/search">
            <input class="keyword pure-input-rounded" type="text"  name="q" value="@if (isset($q)) {{ $q }} @endif">
            <button type="submit" class="pure-button pure-button-primary">搜索</button>
        </form>
    </div>
</div>