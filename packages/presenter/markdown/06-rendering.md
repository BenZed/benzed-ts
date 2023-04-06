<!-- @CenterHeader clear skip -->
# RENDERING

<!-- @Section clear -->

## Asset Manager Rendering

- One of the machines on the ground over there is running a very simple Robot 🤖
- That robot connects to the `Asset Manager` as a user.
- The robot watches the `Asset Manager` for any preview files that are uploaded
- The robot downloads those preview files, compresses them, and then re-uploads them using the `Asset Manager API`

<!-- @Prompt -->
Rendering on the current Asset Manager is a straight up hack. If that machine on the *floor* over there were to break or get unplugged, all Rendering on Gears would stop happening.

<!-- @CenterHeader clear skip -->
# AWS Lambda

<!-- @Prompt -->
Gears files are stored on `AWS` via **S3**, the Gears database would be on `AWS` **DynamoDB**, so it makes sense to use `AWS`'s other features.

<!-- @Section clear -->
## AWS Lambda

<!-- @Section -->

`AWS` Lambda is a serverless, event-driven compute service that lets you run code for virtually any type of application or backend service without provisioning or managing servers. You can trigger Lambda from over 200 `AWS` services and software as a service (SaaS) applications, and only pay for what you use.

<!-- @Prompt -->
Introducing `AWS` Lambda. I didn't write this introduction, I ripped it off their website. Basically, for rendering, and any other compute intensive tasks that Gears might be responsible for in the future, I would use this. It scales on it's own. So, hypothetically, if a large number of files are being uploaded at once, lambda would scale up to get them all done in a timely manner.