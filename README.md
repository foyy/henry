# Hunter Leeves Henry Meds

This was rad! There's a good amount of subtle complexity here--particularly around how to model schedules and appointments and their relationship. I could spend another whole day finishing things up. If I had more time, I think I'd tackle the following things, somewhat in this order:

- Add tests at the controller, business logic, and DB Adapter level
- Break out the code actually interacting with the DB into it's own adapter file
- Add validation/handling of inputs to the API
- Add the database code: schema, actual CRUD operations, tests
- Add the REDIS instance and setup the actual reservation lock
- Better error handling
- Include part of the READ.ME on how to actually run the service
- The code for handling time/timezones to ensure we aren't disrespecting the true dev villain: time
- Finally clean out my garage

Also, you'll see I tried to put any notes longer than a couple lines here in the READ.ME with a reference to that in the code. Hopefully that's more readable, but of course there's a tradeoff there to since you have to have your other window open to the READ.ME, so that's a meta-tradeoff, since all I really am talking about here is tradeoffs so you're reading about tradeoffs within a tradeoff.

Lastly, the hardest part here was keeping this to 3 hours, as it's a bit of a Prisoner's Dilema, since if other potential hires spend like 8 hours on it, but say they spent 3, I look like a doofus. I went over 3 hours by a bit, but the over-time was spent mostly typing here in the READ.ME, as I kind of nerded out around some of the tradeoffs.

### A note on AI.

We are in a weird world now where someone could ask Claude all of this and it could probably do some (all?) of it. I want to note that I came up with the approaches and discussions around pros/cons, as well as the code itself. I did not rely on AI to generate my approach/approaches. But I also think AI is like a super-charged learning tool/stack overflow and use it in my daily dev like. Here on this project, I used it for things like:

- remember raw express syntax like how to hand it request Body types and params as I've been using TSOA/Nest for a long time
- remembering UTC/ISO timestring details/pitfalls
- math like how many 15 chunks are in a day/year and what amount of table load that equates to

Ok, onto notes on the code/approaches:

## First bit of complexity--Schedule && Appointments Modeling

The first thing that jumped out to me once I started mapping out how this API would work was more or less: how do I want to model the provider's schedule vs actual appointments? There are a lot of tradeoffs here once you start digging, and I had a lot of fun trying to figure out the best approach. It's especially interesting since there aren't that many doctors relative to people-with-phones, which makes that variable somewhat unique (compared to more public facing apps where scaling could go to x millions "easily") Some initial thoughts were:

1. Do we actually need a Schedules table/data model? Could we just x amount of empty appointments every day? Since there aren't that many doctors in the USA (~1 million), and Henry would only be partnering with a small percent, traditional scaling concerns might not be nearly as relevant. More notes below.

2. Ok then, so we need a way to model schedules, exceptions to shedules, and maintain the relationship to avaialable appointments. This is a better model of the real-world data and relationships, but a fair amount more schema complexity than the option above. More notes below.

### One option - Timeslots Only, AKA No Schedule, only Appointments.

The pure simplest/easiest to implement would be to have empty appointments/rows on our appointments table, and mark whether they fall in the range of a provider's schedule through a column. Then, when a doctor passes in their schedule, we would flip the status from: 'open' to 'blocked'. Then, we are only reasoning around a list of appointments. No need to join or upkeep on a Schedule table or worry about exceptions to the schedule. There's merit there. I began to use this approach in the persistence file to get something quick/easy to make the routes work.

However, the downsides here are plenty, namely:

1. we're creating a ton of unused rows. If we have 50,000 doctors, that's like ~4,800,000 rows added a day. Now, even if half that by removing the ones in the middle of the night--which is likely complicated and maybe not feasible--, it's still a crazy amount of pure inserts.

- We could modify the existing row daily, rather than creating a new one, and store the appointment history in a warehouse, which is an interesting thought. But then you're in the business of managing that many updates daily.
- Reads potentially slow and expensive
- Big costs when scaling this solution out, as for every 1 doctor we onboard, that's 96 more daily rows.

Ultimately, I think this actually isn't that terrible if you don't see your service growing to that many doctors--or if you can cleverly come up with ways to reduce that daily row count--maybe something like batching them into hours rather than 15 minute slots. But I think the next option is better:

### 2nd option - Schedule Table and Appointments

Alternatively, we could model the practitioner's schedule as a table. This has its own tradeoffs. Namely, it's not a super easy model to maintain or update either. To use the example in the directions of a doctor wanting to scehdule a certain timeframe on a certain date, that means.

1 Have to either have an exceptions table that stores exceptions to the default scehdule. But this means you'd have to check that table first every time you fetch appointments (or potentially keep a flag on the default table with hasException: true or something like that)

2 Try to model the "priority" of a schedule, meaning you could have two schedule entries for a doc, but if one is higher pri it's the one you use. This does not feel like a mature solution either.

3 Have a new schedule entry each day. So, 365 entries per doc and modify the entry when they want to adjust their schedule. Downside is the amount of storage, compared to 1 entry per doctor, but I think this is a decent choice that threads the line between simple and robust and is what I went with.

### REDIS for Reservations

I read a cool article somewhere on distributed locks--Quastor, I think--about using REDIS to handle systems where a short reservation period are a thing, like with Ticketmaster. I think using REDIS to store the relevant ids as the key and giving it a TTL is an elegant solution to the problem, as it:

- Avoids overloading your main table
- The logic is easy to follow
- In memory stores like REDIS are wicked fast, which alleviates some of the pain of the extra step of needing to check it when fetching open appointments
- On confirmation, if you add to the SQL DB prior to removing the lock, you don't run into race conditions when a user fetches available time vs insertion of a new record

_NOTE_ I think you would also use REDIS to store the current day's appointments as well, since it's not a huge amount of data and would speed up that part of our pipeline.

## HERE ON OUT - Smaller Considerations

These are smaller notes I wrote as I went along. It's always a bit hard to turn off the part of my brain when I'm doing something I find kinda hacky, so I tried to offload that part of my brain here so I could get through the core route logic.

### 1.0 - Basic Structure

I opted for the tried and true express to get this up and running. There are a number of things we'd want to flesh out more if we were shipping this to production:

- I've used TSOA and Nest.js in the past and would prefer something more like Nest.js on a production API than bare Express. While Nest.js is opinionated, and has a bit of a learning curve, it offers a strong/compelling set of tools and paradigm for API construction. I'm undecidecd on decorators overall but like them at the controller level.
- Input validation. Ensuring what our clients are sending us is what we expect.
- Auth/permissions/security considerations. Locking down operations to ensure only
- Logging. More robust logging/analytics are possible, as we might want to know how often a provider's appointments are fetched
- Better error handling. Would create custom Error Classes to handle our expected errors.

### 1.1 - Auth

I'm handwaving Auth here. Likely,:

- Auth would happen upstream, likely with OAuth
- Would be handled by API Gateway
- The BEARER/JWT would have our `providerID`

### 1.2 - Get Appointments

- Not super clear on if we should actually allow them to fetch a list of appointments earlier than a day out (since we can only reserve >=24 hours out).
- Not including pagination or filtering here, but we'd want that if the user passes in a large date range. We woul also just block large time ranges to prevent odd behaviour querying for huge unneeded data on our tables.

### 1.3 - Not on Error handling

This is not a robust error handling solution. I like to have specific Error classes for common error cases in order to return back useful data to the client, both for debugging and metrics/observability.

### 1.4 - Creating Schedules

- I'm assuming some logical amount of time we are creating schedules ahead of time, possibly for the month.
- Just noting I'm not INSERTING and then ON CONFLICTing, which might be not ideal
- I think date_trunc works well here to target the date but noting I didn't spend a ton of time here and it's a huge point of bug-creation if this query is off.
- We'd likely us an ORM in production databases

### 1.5 Using REDIS for Reservation Lock

I don't have time to actually implement REDIS here, but I think it's a great use case for the reservation TTL problem.

We could store temporary reservations, prior to confirmation and within the 30 min TTL. Something like:

1. get hold key -> const holdKey = `appointment:hold:${providerID}${startTime}`
2. set value to key as stringified info of appointment, there are options here
3. set TTL to 30 min

With this approach, we wouldn't actually be interacting with our psql DB until the appointment is confirmed. This is great because:

1. it's super fast- REDIS/RAM storage goes vroom vroom
2. we reduce load on our appointments table, likely a table with already a lot of traffic
3. avoids complexity/multi-writes on that table

### 1.6 Confirming Resrvation with REDIS

I don't have time to actually implement REDIS here, but here's the order of operations for confirming a reservation:

1. Add the appointment to the DB. We do this BEFORE removing the REDIS hold is removed to avoid the race condition where someone checks for appointments after the hold is removed but before it's added in our pSQL DB.

2. Invalidate the REDIS cache. Since we're confirming the appointment, we don't need the hold any longer

3. Add the appointment to the appointments DB. I'm noting here that there may be an issue with the lag between removing the hold and inserting into the DB,
   as if someone were to read from the appointments DB in the interim, when the lock is GONE but the appointment hasn't been inserted, they maybe told there is an available time when there isn't. This is a tradeoff I'm acknolwedging atm.

### 1.7 - In-Memory Hacky Temporary Solution

This is a quick/hacky way to get the create schedule/get appointments routes to actually work. It feels a bit silly given the non-usability of something like this, but I don't have time to implement a real DB and this at least gets those 2 routes workable.

You'll note I went with the simplest possible option of storing this in a giant appointments array. As discussed above--this is not what I would go with at scale in production, but it is achievable fairly quickly to prototype something out.

I did not spend the amount of time on this in-memory solution that I did thinking through the production-level potential solution, which is why you don't see the level of depth here as you do in my discussion above.
