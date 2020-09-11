#!/usr/bin/env perl
use Mojolicious::Lite;

get '/' => {text => 'hello 🌍 world!', format => 'text'};
get '/:name' => {template => 'staff'} => 'staff';
get '/' => {template => 'home'} => 'home';

app->start;

__DATA__

@@ staff.html.ep
<p>This is <%= ucfirst $name %>.</p>

@@ home.html.ep
<p>Welcome to The North Pole!</p>

<p>
  Say hi to <%= link_to 'Santa' => staff => {name => 'santa'} %>
  and <%= link_to 'Rudolph' => staff => {name => 'rudolph'} %>.
</p>

