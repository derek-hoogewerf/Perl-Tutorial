#!/perl/bin/perl
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

print "$my_info";

my $bunch_of_info<<"END";
This is a 
bunch of information
on multiple lines.
END

say $bunch_of_info;

my $big_int = 18446744073709551615;
printf ("%u \n", $big_int + 1);

my $big_float = .10000000000000000001;
printf ("%.16f \n", $big_float + $big_float);

#math functions
say "5 ** 4 = ", 5**4;

say "EXP 1 =", exp 1;
say "HEX 10 =", hex 10;
say "OCT 10 =", oct 10;
say " INT 6.45 =", int 6.45;
say "LOG 2 =", log 2;
say "Random number 0-10 =", int rand(11);
say "SQRT 4 =", sqrt 4; 