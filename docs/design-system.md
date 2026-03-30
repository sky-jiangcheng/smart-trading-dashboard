# Investment Dashboard Design System

This document defines the product identity, layout rules, and interaction model for the two surfaces in this workspace:

- `board`: the investment reading terminal
- `admin`: the control cockpit

They share backend data, but they must not share the same UI personality.

## 1. Product Identity

### Board

`board` is the reading layer for investment information.

It should feel:

- light
- elegant
- premium
- precise
- calm under density

Its job is to help a user understand:

- what is moving
- why it matters
- which dimension it belongs to
- which assets or reports it touches

### Admin

`admin` is the operating layer for the system.

It should feel:

- mature
- controlled
- technical
- stable
- highly operable

Its job is to help a user manage:

- sources
- thresholds
- rules
- activity
- settings

## 2. Shared Principles

### 2.1 Split identity

`board` and `admin` may reuse data, but they must not reuse the same visual language.

- `board` should read like a market brief or trading terminal.
- `admin` should read like a luxury cockpit.

### 2.2 Strong hierarchy

Every screen must answer three questions in order:

1. What matters now?
2. What dimension does it belong to?
3. What should the user do next?

### 2.3 Semantic presentation

Raw lists are not enough. Content must be wrapped in meaning.

Examples:

- news should expose `dimension`, `whyItMatters`, and `relatedAssets`
- signals should expose `direction`, `strength`, `confidence`, and `triggerReason`
- thresholds should expose `category`, `unit`, `priority`, and `note`

### 2.4 Assisted input

High-frequency configuration flows must provide:

- presets
- chips
- defaults
- inline hints
- auto-formatting

The user should not be forced to remember expert-level field combinations.

## 3. Visual Language

### 3.1 Board tokens

Use a lighter, editorial tone.

- background: soft gradient or pale neutral field
- surface: near-white, slightly translucent
- border: thin and quiet
- accent: one primary accent plus restrained status colors
- shadow: minimal
- radius: soft, but not playful
- typography: clean hierarchy, fewer competing weights

Recommended feeling:

- premium newsroom
- market briefing desk
- investment reference surface

### 3.2 Admin tokens

Use a cockpit tone.

- background: neutral and controlled
- surface: structured panels
- border: clear but not heavy
- accent: restrained, mechanical, state-driven
- shadow: layered, not decorative
- radius: consistent and slightly more formal
- typography: compact, aligned, state-aware

Recommended feeling:

- executive control console
- Mercedes-like cockpit
- precision operating surface

## 4. Layout Models

### 4.1 Board layout

The default `board` shell should be a three-zone reading environment:

- top: market summary and current state
- center-left: news stream
- center-middle: signal stream
- right rail: dimension map and report brief

Design rules:

- do not overfill the hero area
- keep the right rail compact and meaningful
- make dimension cards filter the rest of the page
- keep report content concise and explanatory

### 4.2 Admin layout

The default `admin` shell should feel like a cockpit:

- left rail: persistent navigation spine
- top bar: workspace state and system status
- center: active workspace
- optional side rail: contextual helper content

Design rules:

- one workspace should have one dominant purpose
- the header should explain state, not repeat nav copy
- controls should be compact and grouped
- status should be visible without scrolling

## 5. Board Information Model

### 5.1 Dimension map

`board` content must be mapped to investment dimensions.

Recommended dimensions:

- macro
- liquidity
- valuation
- risk
- event
- flow
- sentiment
- technical
- industry
- earnings

Each dimension card should show:

- label
- current state
- representative assets
- related news count
- related signal count
- short explanation

### 5.2 News model

News should not be shown as a flat feed.

Each item should carry:

- title
- source
- time
- dimensions
- importance
- related assets
- why it matters

### 5.3 Signal model

Signals should feel like decisions, not tags.

Each item should carry:

- title
- direction
- strength
- dimension
- trigger reason
- confidence
- related news
- related assets

### 5.4 Report brief model

Reports should be compact and structured.

Each report should carry:

- period
- dimension
- summary
- key metrics
- interpretation
- related assets

## 6. Admin Workspace Model

### 6.1 Overview

Overview is the system status surface.

It should show:

- API health
- refresh state
- sync state
- current workspace
- the most important action entry

### 6.2 Sources

Sources is a source pool surface.

It should show:

- coverage
- enabled count
- health
- quick add
- active list

### 6.3 Thresholds

Thresholds is a high-frequency configuration surface.

It must solve two problems:

- make editing easy
- keep the result area readable at scale

Required affordances:

- quick presets
- category chips
- direction chips
- priority chips
- unit hints
- tag chips
- draft preview

The result area must:

- support multiple cards without clipping
- wrap cleanly at responsive widths
- keep state, note, and metadata visible

### 6.4 Rules

Rules is a decision-control surface.

It should show:

- rule groups
- filters
- batch actions
- editor
- selection state

### 6.5 Activity

Activity is an audit timeline surface.

It should show:

- event type
- status
- timestamp
- source
- outcome

### 6.6 Settings

Settings is a system parameter surface.

It should show:

- current value
- supported choices
- explanation
- impact

## 7. Interaction Rules

### Board

- default to reading, not editing
- use click-to-filter for dimensions
- show a clear selected state
- keep motion subtle and purposeful
- collapse noise before cluttering the page

### Admin

- default to control, not exploration
- make changes obvious immediately
- use strong feedback for state transitions
- keep destructive actions visually isolated
- avoid dense multi-column form stacking

## 8. Backend Semantics

The frontend can only feel premium if the backend provides semantic data.

Required semantics:

- `dimension`
- `whyItMatters`
- `relatedAssets`
- `confidence`
- `direction`
- `strength`
- `priority`
- `unit`
- `relatedNewsIds`

These fields should be used to drive layout and prioritization, not just labels.

## 9. Quality Bar

### Board

Success means:

- the page feels elegant, not busy
- the user can read market context quickly
- dimension navigation creates understanding, not just filtering

### Admin

Success means:

- the page feels like a mature cockpit
- configuration is faster and safer
- each workspace has a clear purpose
- the surface looks intentional instead of assembled

## 10. Implementation Order

When extending the product, use this order:

1. define semantic data
2. define workspace identity
3. define layout structure
4. define interaction model
5. only then polish visuals

