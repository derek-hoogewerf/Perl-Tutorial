use strict;
use warnings;
use diagnostics;

use feature 'say';
use feature  'switch'; 
use v5.30;

print "Hello World\n";
my $name = 'Derek';
my ($age, $street) = (20, '123 Main Street');
my $my_info = "$name lives on \"$street\"\n";

$my_info = qq{$name lives on "$street"\n};