

const globalFunConstructor = () => {
    
    const $ = {};

    $.matchSearchEngine = (url = "") => {

        const engines = [
            { name: '百度搜索', key: 'baidu.com' },
            { name: '谷歌搜索', key: 'google.com' },
            { name: '搜狗搜索', key: 'sogou.com' },
            { name: '360搜索', key: 'so.com' },
            { name: '必应搜索', key: 'bing.com' },
        ];

        let engine = '';

        for (let i = 0; i < engines.length; i++) {
            if (url.indexOf(engines[i].key) > -1) {
                engine = engines[i].name;
                break;
            }
        }

        return engine;
    }


    return $;
}

const GlobalFun = globalFunConstructor();

export default GlobalFun;
