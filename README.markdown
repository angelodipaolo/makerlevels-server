# Maker Levels Server

A Node.js server built on [hapi.js](https://github.com/hapijs/hapi) and [MongoDB](https://github.com/mongodb/mongo) that provides an HTTP API for storing and retrieving Super Mario Maker level data. This was a weekend side-project that I never completed so I decided to publish the source code. This project was started in September 2015 and abandoned shortly after so depedencies are out-of-date.

## JSON API

### Levels


#### GET /courses/{course_id}

Fetch the level with the `course_id` value of "1234-0000-1234-1234".


###### Request

```
GET /courses/1234-0000-1234-1234
```

###### Response

```
{
  level: {
    "_id": "560c884deae5c0fc28c39781",
    "course_id": "53A3-0000-0072-9863",
    "name": "pipes and pipes ans pipes 2"
  }
}
```

#### GET /levels/{level_id}

Fetch the level with the `level_id` "560c884deae5c0fc28c39781".

###### Request

```
GET /levels/560c884deae5c0fc28c39781
```

###### Response

```
{
  level: {
    "_id": "560c884deae5c0fc28c39781",
    "course_id": "53A3-0000-0072-9863",
    "name": "pipes and pipes ans pipes 2"
  }
}
```

#### GET /levels

Fetch a list of levels.

###### Request

```
GET /levels
```

###### Response

```
{
  levels: [{
    "_id": "5604b733c1ffd708fbcc4836",
    "course_id": "599B-0000-006A-8B92",
    "name": "Airship One"
  }, {
    "_id": "5606cc595d9648d2196f3a39",
    "course_id": "3F5A-0000-0050-C7E6",
    "name": "bullet jump drop"
  }, {
    "_id": "560c884deae5c0fc28c39781",
    "course_id": "53A3-0000-0072-9863",
    "name": "pipes and pipes ans pipes 2"
  }]
}
```

#### GET /levels/me

Fetch all levels that belong to the currently authenticated user.

###### Request

```
GET /levels/me
```

###### Response

```
{
  levels: [{
    "_id": "5604b733c1ffd708fbcc4836",
    "course_id": "599B-0000-006A-8B92",
    "name": "Airship One"
  }, {
    "_id": "5606cc595d9648d2196f3a39",
    "course_id": "3F5A-0000-0050-C7E6",
    "name": "bullet jump drop"
  }, {
    "_id": "560c884deae5c0fc28c39781",
    "course_id": "53A3-0000-0072-9863",
    "name": "pipes and pipes ans pipes 2"
  }]
}
```

#### POST /levels

Insert a new level record.

###### Request

```
POST /levels
Content-Type: multipart/form-data

--level-boundary
Content-Disposition: form-data; name="level"
Content-Type: application/json
{
  // Nintendo's Course ID. Value that allows 
  // players to find the level in mario maker
  "course_id": "53A3-0000-0072-9863",

  // course name
  "name": "pipes and pipes and pipes 2",

  // the user id of the user that added the level to our db. 
  // not necessarily the same user that created the level in mario maker
  "user_id": "12345"
}

--level-boundary
Content-Disposition: form-data; name="screenshot"
Content-Type: image/jpeg
{jpeg image data}
```

###### Response

```
{
  level: {
    "course_id": "53A3-0000-0072-9863",
    "_id": "560c884deae5c0fc28c39781",
    "name": "pipes and pipes and pipes 2",
    "user_id": "12345",
    "screenshot_url": "tehurltothescreenshot.jpeg"
  }
}

```

#### PUT /levels/{level_id}

Update a level record using the `level_id`.

###### Request

```
PUT /levels/560c884deae5c0fc28c39781
{
  "level": {
    "course_id": "53A3-0000-0072-9863",
    "name": "pipes and pipes and pipes 5",
    "user_id": "12345" 
  }
}

```

###### Response

```
```

#### DELETE /levels/{level_id}

Delete a level record using the `level_id`.

###### Request

```
DELETE /levels/560c884deae5c0fc28c39781
```

###### Response

```
```


### Users

#### GET /users/{user_id}

Fetch the user with the `user_id` of "12345".

###### Request

```
GET /users/12345
```

###### Response

```
{
  user: {
    "name": "angelojdipaolo@icloud.com",
    "_id": "12345",
    "miiverse_name": "mordecai101"
  }
}
```

#### GET /users/me

Fetch the currently authenticated user.

```
{
  user: {
    "name": "angelojdipaolo@icloud.com",
    "_id": "12345",
    "miiverse_name": "mordecai101"
  }
}
```

#### POST /users

Insert a new user record.

```
{
  "name": "angelod101@gmail.com",
  "password": "iliketurtles",
  "miiverse_name": "mordecai101"
}
```

#### PUT /users/12345

Update a user record.

```
TODO
```


#### DELETE /users/12345

Delete a user record.

```
TODO
```

## curl testing

### inserting a level

curl -H "Content-Type: application/json" -X POST -d '{"id":"1234-0000-1234-1234","name":"Zone E"}' http://localhost:3000/levels

### inserting a user

curl -H "Content-Type: application/json" -X POST -d '{"name":"mordecai","miiverseUserName":"mordceai101","password":"12345"}' http://localhost:3000/users


## Copyright

Copyright © 2015-2016 [Angelo Di Paolo](http://angelodipaolo.org). All rights reserved.
