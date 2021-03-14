# Live Stocker
- Live Stocker는 가축 농장의 농장주의 비즈니스 의사결정을 도와주는 웹 사이트입니다.
- Live Stocker 에서 제공하는 정보를 통해 어떤 가축을 중점적으로 키웠을 때 수익성이 가장 증진되는 지 확인할 수 있습니다. 이를 통해 농장을 Scale-Up 하기 위한 방법을 모색하십시오.

## 0. 기본적으로 NPM이 설치되어 있어야 합니다. & 데이터베이스는 MySQL을 사용해주세요.

## 1. 테이블 설정.
```
    // Animal table.
    
    CREATE TABLE `animal` (
      `id` int NOT NULL AUTO_INCREMENT,
      `type` varchar(20) COLLATE utf8_unicode_ci NOT NULL DEFAULT '소, 돼지, 염소, 양',
      `name` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
      `user_id` int NOT NULL,
      `parent` int DEFAULT NULL,
      `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      `deleted_at` datetime DEFAULT NULL,
      PRIMARY KEY (`id`),
      KEY `user_id_idx` (`user_id`),
      CONSTRAINT `FK_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    
    // Feed table.
    
    CREATE TABLE `feed` (
      `id` int NOT NULL AUTO_INCREMENT,
      `user_id` int NOT NULL,
      `type` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
      `price` int NOT NULL,
      PRIMARY KEY (`id`),
      KEY `FK_Feed_User_idx` (`user_id`),
      CONSTRAINT `FK_Feed_User` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    
    // Price_Tag table.
    
    CREATE TABLE `price_tag` (
      `id` int NOT NULL AUTO_INCREMENT,
      `user_id` int NOT NULL,
      `type` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
      `price` int NOT NULL,
      PRIMARY KEY (`id`),
      KEY `FK_Price_Tag_User_idx` (`user_id`),
      CONSTRAINT `FK_Price_Tag_User` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    
    // User table.
    
    CREATE TABLE `user` (
      `id` int NOT NULL AUTO_INCREMENT,
      `nickname` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
      `email` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
      `password` varchar(101) COLLATE utf8_unicode_ci NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci

```

## 2. database/pool.js 내의 코드 설정.
```
    const pool = mysql.createPool({
        // host: '사용자 입력',  ex) host: 'localhost',
        // port: '사용자 입력',  ex) port: '3306',
        // user: '사용자 입력',  ex) user: 'root',
        // password: '사용자 입력', ex) password: '1234',
        // database: '사용자 입력'  ex) database: 'livestock'
    })
```
## 3. git clone 하기.
```
    git clone http://khuhub.khu.ac.kr/2020-02-database/2016104112.git
```
## 4. git clone  후 작업.
```
    2016104112 folder 내에서 (root 폴더 내에서)
    npm install  // 필수환경 설치
    npm start    // 서버 시작
```

## 5. localhost:3000 접속.
-    초기 설정은 아무 것도 되어 있지 않으므로 회원가입, 사료 가격 및 가축 가격 설정부터 해주셔야 합니다!# livestocker
