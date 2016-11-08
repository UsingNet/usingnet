@extends('admin.layouts.auth')

@section('content')
    <form action="" method="post">
        <input type="hidden" name="_token", value="{{ csrf_token() }}">
        <div class="form-group">
            <input class="form-control" type="password" name="password" placeholder="密码" required>
        </div>

        <div class="submit">
            <button class="btn btn-danger" type="submit">登录</button>
        </div>
    </form>
@endsection