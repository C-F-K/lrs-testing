#!/usr/bin/perl

my $in = shift @ARGV;
my $out = $in;
$out =~ s/(.*)(\..*)/\1_dsmvwld\2/;

open my $vowel, "<", $in or die "$in: $!";
open my $disemvowel, ">", "$out" or die "$out: $!";
while (<$vowel>) {
    # modify this bit to change what lines to select
    if ($_ =~ /^\t"abbr":/) {
    ###
        # modify this bit to change what bits to capture from selected lines
        /^\t"abbr": "(.*)",$/;
        ###
        my $dis = $1;
        $dis =~ s/[AEIOUaeiou]//g;
        $dis =~ s/\s//g; # comment this out to stop also eating whitespace
        if (length($dis) > 32) { print STDOUT "$dis\n"; }
        $_ = "\t\"abbr\": \"" . $dis . "\",\n";
    }
    print $disemvowel $_;
}
close $vowel;
close $disemvowel;
exit;

# TODO: 
# Make the line-selecting and pattern-capturing bits modifiable from command line
