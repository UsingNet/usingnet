<aside class="col-md-3">
    <ul class="nav nav-pills nav-stacked">
        @foreach ($menu as $item)
            <li><a href="{{ $item['href'] }}">{{ $item['name'] }}</a></li>
        @endforeach
    </ul>
</aside>