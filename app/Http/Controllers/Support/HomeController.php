<?php

namespace App\Http\Controllers\Support;

use App\Models\Knowledge\Category;
use App\Models\Knowledge\Knowledge;
use App\Models\Setting\Support;
use App\Models\Team;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Validator;

class HomeController extends Controller
{

    private $support;

    public function __construct()
    {
        $host = $_SERVER['HTTP_HOST'];
        $this->support = Support::where('domain', $host)->first();
        if (!$this->support) {
            abort(404);
        }
        $team = Team::where('id', $this->support->team_id)->first();

        $hots = Knowledge::where('team_id', $this->support->team_id)
            ->where('team_id', $this->support->team_id)
            ->orderBy('views', 'desc')
            ->take(10)
            ->get();

        view()->share(['support' => $this->support, 'team' => $team, 'hots' => $hots]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getIndex()
    {
        $hots = Knowledge::where('team_id', $this->support->team_id)
            ->where('team_id', $this->support->team_id)
            ->orderBy('views', 'desc')
            ->take(10)
            ->get();

        $categories = Category::where('team_id', $this->support->team_id)
            ->where('parent_id', null)
            ->with('children')
            ->take(10)
            ->get();

        foreach ($categories as $category) {
            foreach ($category->children as $children) {
                $children->articles = Knowledge::where('parent_id', $children->_id)->orderBy('views', 'desc')->take(5)->get();
            }
        }

        return view('support.index', compact('hots', 'categories'));
    }

    public function getSubmit()
    {
        $categories = Category::where('parent_id', '<>', '')->where('team_id', $this->support->team_id)->get();

        return view('support.submit', compact('categories'));
    }

    public function getArticle(Request $request, $id)
    {
        $article = Knowledge::where('_id', $id)->where('team_id', $this->support->team_id)->with('user')->first();
        if (!$article) abort(404);
        $article->increment('views');

        $articles = [];
        if ($article->parent_note_id) {
            $articles = Knowledge::where('parent_note_id', $article->parent_note_id)->where('_id', '<>', $article->_id)
                ->orderBy('views', 'desc')
                ->take(10)
                ->get();
        }

        $category = Category::where('_id', $article->parent_id)->first();
        $parent = Category::where('_id', $category->parent_id)->first();
        $breadFirst['name'] = $parent->title;
        $breadFirst['url'] = asset('category/' . $parent->_id);
        $breadSecond['name'] = $category->title;
        $breadSecond['url'] = asset('list/' . $category->_id);

        return view('support.article', compact('article', 'articles', 'breadFirst', 'breadSecond'));
    }

    public function getSearch(Request $request)
    {
        $q = trim($request->get('q'));

        $knowledges = Knowledge::where('team_id', $this->support->team_id)
            ->where(function ($query) use ($q) {
                $query->where('title', 'regex', new \MongoRegex('/' . $q . '/'))
                    ->orWhere('message', 'regex', new \MongoRegex('/' . $q . '/'));
            })
            ->paginate(10);

        $breadFirst = '搜索结果';

        return view('support.search', compact('q', 'knowledges', 'breadFirst'));
    }

    public function getCategory($id)
    {
        $category = Category::where('_id', $id)->with('children')->where('team_id', $this->support->team_id)->first();
        if (!$category) abort(404);

        $breadFirst = $category->title;

        foreach ($category->children as $child) {
            $child->articles = Knowledge::where('team_id', $this->support->team_id)->where('parent_id', $child->_id)->take(10)->get();
        }

        return view('support.category', compact('category', 'breadFirst'));
    }

    public function getList($id)
    {
        $category = Category::where('_id', $id)->where('team_id', $this->support->team_id)->first();
        if (!$category) abort(404);

        $lists = Knowledge::where('parent_id', $category->_id)->paginate(20);
        $parent = Category::where('_id', $category->parent_id)->first();

        $breadFirst = ['url' => asset('category/' . $parent->_id), 'name' => $parent->title];
        $breadSecond = $category->title;

        return view('support.list', compact('lists', 'category', 'parent', 'breadFirst', 'breadSecond'));
    }

    public function getGood(Request $request, $id)
    {
        $knowledge = Knowledge::where('_id', $id)->where('team_id', $this->support->team_id)->first();

        $cookie = $request->cookie('usingnet_votes');
        $ids = explode(',', $cookie);
        if (in_array($id, $ids)) {
            return redirect()->back();
        }
        $ids[] = $id;
        $cookie = Cookie::make('usingnet_votes', implode(',', $ids));
        if (!$knowledge) abort(404);
        $knowledge->increment('good');
        return redirect()->back()->withCookie($cookie);
    }

    public function getBad(Request $request, $id)
    {
        $knowledge = Knowledge::where('_id', $id)->where('team_id', $this->support->team_id)->first();
        if (!$knowledge) abort(404);
        $knowledge->increment('bad');


        return redirect()->back();
    }

    public function postSubmit(Request $request)
    {
        $data = $request->only('email', 'title', 'content','category');
        $validator = Validator::make($data, [
            'email' => 'email.required',
            'title' => 'required',
            'content' => 'required',
            'category' => 'required'
        ]);

        if ($validator->fails()) {
            return redirect()->withErrors($validator);
        }


    }
}
