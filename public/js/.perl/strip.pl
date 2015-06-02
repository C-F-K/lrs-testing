#!/usr/bin/perl

sub parse_file {
    my $file = shift;
    open my $parse, "<", $file or die "$file: $!";
    my @arr;
    while (<$parse>) {
        $_ =~ s/^([A-Z]*).*$/\1/;
        push @arr, $_; 
    }
    close $parse;
    for (@arr) {
        $_ =~ s/(.*)\n/"\1",/;
    }
    for ($file) {
        s/(.*)(\.txt)/\1_arrayed\2/;
    }
    open my $parsed, ">", $file or die "$file: $!";
    print $parsed "[";
    for (@arr) {
        print $parsed $_;
    }
    print $parsed "];";
    close $parsed;

    if (@_) { parse_file(@_); }
}

parse_file(@ARGV);
