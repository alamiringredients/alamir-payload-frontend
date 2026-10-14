import type {ReactNode} from 'react'
import {PageHero} from '@/components/site/page-hero'

export function BookingPageBody(widget:ReactNode){return <main id="main"><PageHero className="bk-hero" image="/assets/photos/book-meeting.webp" imageAlt="An Alamir Ingredients export manager and a buyer reviewing a specification sheet beside tomato and mango samples"><div className="kicker">Book a meeting</div><h1>Thirty minutes with the <em>export team.</em></h1><p>Pick a slot that works in your time zone. We will confirm by email with a calendar invite, and if you are meeting us at a show the same slot holds a seat on the stand.</p></PageHero><section className="band bk-band"><div className="wrap">{widget}</div></section></main>}
