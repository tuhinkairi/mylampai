"use client"
import React from 'react'
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  MapPinIcon,
  DollarSignIcon,
  ClockIcon,
  BriefcaseIcon,
  User2Icon,
} from "lucide-react";

interface Profile {
  id: string;
  skills: string[];
  profiles: string[];
  expectedSalary: number;
  locationPref: string;
  experienceYears: number;
  availability: string;
  createdAt: string;
}

function DetailedProfile({ profile }: any) {
//   console.log("profile:: ",profile)
  return (
    <div><Card key={profile.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Developer {profile.id} Profile</CardTitle>
              <span className="flex gap-2"><User2Icon/>{profile.user.name}</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Skills</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile?.skills?.map((skill:any) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Profiles</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.profiles?.map((prof:any) => (
                      <Badge key={prof} variant="outline">
                        {prof}
                      </Badge>
                    ))}
                  </div>
                </div>
                {/* {profile.certifications.length > 0 && (
                  <div>
                    <h3 className="font-semibold">Certifications</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.certifications.map((cert) => (
                        <Badge key={cert} variant="default">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )} */}
                <div className="flex items-center">
                  <DollarSignIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Expected Salary: ${profile.expectedSalary}</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Location Preference: {profile.locationPref}</span>
                </div>
                <div className="flex items-center">
                  <BriefcaseIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Experience: {profile.experienceYears} years</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Availability: {profile.availability}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>
                    Created: {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {/* <Button type="button" onClick={() => handleAddUser(profile.userId)}>
                  Add User
                </Button> */}
              </div>
            </CardContent>
          </Card></div>
  )
}

export default DetailedProfile