# Bevy Software Engineering Coding Assessment
### API integrations for Notifications 

**Rules**: We want you to give us the best possible sample of work, so you are allowed to use any tools or resources at your disposal. Just use common sense and please don’t submit plagiarised work. For example: asking someone else to do the work for you or forking someone else repo and turning it in as your own work.

**Technical Requirements**: Work will only be accepted in Javascript, Python, or Ruby. Bevy primarily uses React, Django, Django Rest Framework, and NextJS. However, it's fine to use Flask, Vue, Angular, or similar frameworks, or just use the languages standard library. You can use any database you want.

**Timeline**: We understand that many people have commitments outside of work that can make it challenging to find the time to do an assessment. At the same time work samples are one of the most predictive ways for an employer to assess a candidate, even if it slows down the interview process. With that in mind we request that you complete this assessment within one week receiving it. However, the sooner you turn it in the sooner we can get to the next interview round and a potential offer of employment. If you need to renegotiate that timeline that's ok! Just let us know and we will work with you. However, if we don’t hear anything from you within two weeks we will assume you found another role and close your application. This assessment is only intended to take about three hours; if you can’t do that as take home we are happy to offer a paired programming live interview as an alternative. You may submit your work by updating this github repo.

**Grading and Evaluation**: Generally one - three Bevy engineers will review your submission just like they would any Pull/Merge Request review. We will evaluate if each of the objectives has been implemented, how efficiently it was implemented (algorithmically and software patterns/design), how you can be sure that it works (like tests), how you handled edge cases, and how well you followed best practices for the technologies you used. Your submission will be graded holistically, so don’t worry too much if you don’t feel good about a specific part of your solution. In the next round we will certainly discuss the pros and cons of your solution and your reasoning behind your technical decisions.

**Prerequisites**: You will need to register Free/Trial API keys for Twilio SMS and SendGrid

**Description**: Bevy needs to write a new API service that allows users to save user notification preferences and send them via email or SMS.

**Objectives**:
1. Write a new api endpoint that allows a user to update their notification preferences to be “email”, “sms”, or “None”. The user must also be able update their phone number and email address.
2. Write an endpoint that allows a user to create, or get a notification that includes fields for notification title, notification text, and notification datetime. 
Your notification endpoint should trigger an email or sms event via the [Twilio SMS API](https://www.twilio.com/docs/usage/api#send-an-sms-with-twilios-api) or [Twilio SendGrid Email API](https://www.twilio.com/sendgrid/email-api). In the event a user does not want notifications, then neither should be sent.
3. Write a clear Readme for how to run and use your code

Protip: If you're unsure where to start with this project consider starting from the Django Rest Framework (Most Bevy APIs use this library) [documentation](https://www.django-rest-framework.org/) or the Graphene-Django [documentation](https://docs.graphene-python.org/projects/django/en/latest/).
