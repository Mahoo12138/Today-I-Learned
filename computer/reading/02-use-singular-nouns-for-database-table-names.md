A common debate in relational database circles is whether the names of tables should be singular or plural. If you have a table that stores users, should the table be called `user` or `users`?

The arguments for plural are straightforward:

1. The table is storing more than one user.

2. It reads well in the `FROM` clause:

   ```sql
   SELECT id, name
   FROM users;
   ```

The arguments for singular are more subtle:

1. Strictly speaking, we’re not naming a table, we’re naming a *relation*. We’re describing the relationship between the user’s ID, their name, their address, and so on. And there’s only one relation for user data. It happens that once we’ve described the `user` relation, we can use it for many users.

2. It reads well everywhere else in the SQL query:

   ```sql
   SELECT id, name
   FROM user
   JOIN country ON user.country_id = country.id
   WHERE country.name = 'Canada';
   ```

   That would make less sense if the `ON` clause read `users.country_id`.

3. The name of the class you’ll store the data into is singular (User). You therefore have a mismatch, and in ORMs (*e.g.,* Rails) they often automatically pluralize, with the predictable result of seeing tables with names like `addresss`.

4. Some relations are already plural. Say you have a class called `UserFacts` that store miscellaneous information about a user, like age and favorite color. What will you call the database table?

The last argument above is the strongest, because it only takes one such exception to wreck an entire schema’s consistency. You won’t run into problems with singular, now or later.