# [109-2] Web Programming Final

## author
-  B07902048 李宥霆  
-  B07902014 蔡承濬  
-  B07902011 許耀文  


## 專題題目名稱:  (Group 38) NTU 小工具
-   Demo 影片連結:
-   描述這個服務在做什麼: 
    -   透過使用者提供各自的成績資訊，可查詢經統計後台大歷年課程選中機率與成績分佈
    -   列出使用者所有作業的死線，並提供匯入資料到google日曆或匯出成csv檔（可再加csv檔匯出乘）等功能
-   Deployed連結:
    - 前端：http://18.119.17.36:3000/
    - 後端：http://140.112.30.36:4000/ (工作站連線問題請向資工系217助教群聯繫)
-   使用/操作方式 (含伺服器端以及使用者端)：
    - 使用者端
        - 進入deploy前端網頁
        - 使用者使用台大學號與密碼登入系統
        - 選擇要使用的功能即可
    - 伺服器端
        - 
-   使用與參考之框架/模組/原始碼:
    前端：
    -   react
    -   react-router
    -   react-query
    -   use-query-params
    -   antd
    -   material-ui
    -   react-bootstrap
    -   axios

    後端：
    - node.js
    - mongoDB
    - python3 爬蟲相關套件

- 專題製作心得
    - **李宥霆**
      這次作品我負責的部份為爬蟲、NodeJS與資料庫，從後端收到帳號密碼資料後spawn給python爬網頁資料，爬完後回傳給NodeJS再新增資料到資料庫schema。
      這個project主要功能分成兩部份
      第一部份是計算課程成績分佈，這部份的發想是之前在交流版上看到有人用chrome插件做了搜集使用者的成績資料來計算平均GPA，提供使用者課程成績分佈，但在我在實際去試用之後發現他的功能是故障沒辦法用的，而且顯示的資訊也不夠完整。但這個概念是很好的，於是就決定開發一個網頁的版本來供大家使用。
      第二部份是課程deadline，一來是因為我自己常常忘記作業deadline，然後現行台大又有Cool跟Ceiba兩個系統，容易忘記有deadline，所以就寫了這個功能
    - **許耀文**
        我負責NodeJS以及React之間的串接，調整前端程式碼以及控制網頁的Flow。也使用react-router來控制頁面的跳轉。讓前端可以在Fetch資料時不會壞掉以及將後端的資料放到前端的功能裡面。同時也要微調後端回傳的資料格式或是增加API接口讓前端可以更方便的使用來自後端的資料。前後端分開開發時常常會有一些問題，真的串接起來的時候才知道問題出現在哪裡。
    - **蔡承濬**
      我負責把前端兩個服務的頁面建立好，並添加與使用者互動應有個功能。我認為寫前端最辛苦的是常常找不到錯在哪裡，把資訊印出來也會因為不同步執行的關係看到不對的訊息；另一個很煩人的是東西常常沒有出現在我認為它應該要出現的位置；還有使用現成的套件雖然方便，但有時候想自己加一些別的功能或按鍵會比較麻煩；最後是每個人對使用者的觀感不一樣，若以後有更多時間會執行意見調查或問卷。

* guest帳號密碼：  
帳號：b07902000  
密碼：guestUserPwd  

**注意事項**  
* 流量限制：  
同一個IP 5分鐘內只能發100個query  
* 本網頁部份功能（含登入、作業死線爬蟲）為直接到Ceiba跟Cool爬蟲，所有如果學校網頁登入出了問題或Cool、Ceiba死掉會造成這個網頁無法登入及作業死線爬蟲，若遇到這個問題還麻煩助教告知我們。

## Frontend
### 執行流程
```
> cd frontend
frontend> cp .env_default .env

打開.env改成以下
REACT_APP_BACKEND_URL=http://localhost:4000

frontend> yarn install
frontend> yarn start
等待約30秒
```

## Backend
### 安裝套件
```
> python3 -m pip install bs4 datetime requests
> cd backend
backend> npm install
backend> cp .env.defaults .env

打開.env改成以下
MONGO_URL=mongodb+srv://UT:UT@wpfinal.5zdmc.mongodb.net/wp_final?retryWrites=true&w=majority
PORT=4000

backend> mkdir log
backend> touch log/syslog.txt
backend> npm run server
```

### 參考使用步驟
1. 一開始會進入首頁畫面，點擊上方登入按鈕  
![](https://i.imgur.com/bJeRbnl.jpg)

2. 在登入頁面輸入:  
* 帳號 b07902000  
* 密碼 guestUserPwd  

  後按下登入按鈕  
![](https://i.imgur.com/XGBABtp.jpg)

3. 進去我的作業死線，點擊查看作業死線，等待最多30秒(後端會去Cool跟Ceiba爬資料)
![](https://i.imgur.com/9tF2Njo.png)

4. 顯示結果如下，除了可以修改或刪除爬到的資料，也可以選擇**有到期日的資料**匯出成CSV檔再匯入google日曆，或是直接匯入Google日曆(後者的功能目前因申請google auth API權限需要至少15天的時間，目前須先通知作者(b07902048@ntu.edu.tw)手動加入使用者的google信箱至API才有辦法使用)：
![](https://i.imgur.com/QBRlGwf.png)

5. 上方點選歷年課程資料查詢，輸入「作業系統」後按下搜尋，可以看到下方顯示不同年份的課程資料
![](https://i.imgur.com/M4cSB0f.png)

6. 按下
108-2 作業系統 授課老師：薛智文 和 
109-2 高等作業系統 授課老師：薛智文 
兩堂課程後面的+號，可以發現課程已經被加入選擇，點選查看結果

<img src="https://i.imgur.com/9TELR9H.png" alt="drawing" width="600" height="260"/>


7. 可以看到兩堂課的成績圓餅分佈圖與右邊詳細資料
(右邊登記人數和最終選上人數欄位目前只有109-2有資料)
(由於成績分佈仰賴各個使用者登入後提供自己的成績來繪製，所以目前有許多課程的分佈為100%其他，越多人使用這個系統，資料就會越完整)
![](https://i.imgur.com/175FQn6.png)
