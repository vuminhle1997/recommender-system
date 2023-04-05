# User-User-Filter
The user-user-filter calculates the similarity score for each user and compares each user "u" with another user "v" in the set of users "U".
The higher score to is "v" to "u" (-> 1), then more likely is "v" more similar to "u".
This algorithm makes a similarity matrix between users only, not items. (hence the name: User-User)
## Run and install
First install the dependencies and run the scripts with the third command. It will output the results.
````shell
yarn set version 3.4.1
yarn install
yarn dev
````
