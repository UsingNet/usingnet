<?php

namespace App\Http\Controllers\Api\Knowledge;

use App\Models\Knowledge\Category;
use App\Http\Controllers\Controller;
use App\Models\Knowledge\Knowledge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $categories = Category::where('parent_id', null)
            ->with('children')
            ->where('team_id', $request->user()->team_id)
            ->orderBy('_id', 'desc')
            ->get();

        return $this->responseJson($categories);
    }

    public function store(Request $request)
    {
        $data = $request->only('title', 'parent_id', 'description');
        $data['team_id'] = $request->user()->team_id;
        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if ($data['parent_id']) {
            $parent = Category::where('_id', $data['parent_id'])->first();
            if ($parent->parent_id) {
                return $this->responseJsonError('只允许两级分类', 403);
            }
        }

        $category = Category::create($data);

        return $this->responseJson($category);
    }

    public function update(Request $request, $id)
    {
        $data = array_filter($request->all());
        $category = Category::where('_id', $id)->first();
        if (!$category) {
            $this->responseJsonError('分类不存在', 403);
        }

        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if (isset($data['parent_id'])) {
            $parent = Category::where('_id', $data['parent_id'])->first();
            if ($parent->parent_id) {
                return $this->responseJsonError('只允许两级分类', 403);
            }
        }

        $category->fill($data);
        $category->save();

        return $this->responseJson($category);
    }

    public function destroy(Request $request, $id)
    {
        $category = Category::where(['team_id' => $request->user()->team_id, '_id' => $id])->first();
        if (!$category) {
            return $this->responseJsonError('分类不存在', 404);
        }

        if (Knowledge::where('category_id', $category->_id)->first()) {
            return $this->responseJsonError('请先删除分类下的文章', 403);
        }

        return $this->responseJson($category->delete());
    }

    public function validator(array $data)
    {
        return Validator::make($data, [
            'title' => 'required_without:id|min:2|max:20',
        ], [
            'title.required' => '标题不能为空',
            'title.min' => '标题为2-20个字',
            'title.max' => '标题为2-20个字'
        ]);
    }
}
