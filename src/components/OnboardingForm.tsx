"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Loader2, Activity, Shield, UserCircle, Phone, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { cn } from "../lib/utils";

const steps = [
  { id: "basic", title: "Basic Information", icon: UserCircle },
  { id: "medical", title: "Medical Details", icon: Activity },
  { id: "lifestyle", title: "Lifestyle & Health", icon: Shield },
  { id: "emergency", title: "Emergency & Other", icon: Phone },
];

interface FormData {
  // Step 1
  fullName: string;
  dob: string;
  age: string;
  gender: string;
  phone: string;
  address: string;
  // Step 2
  bloodGroup: string;
  allergies: string;
  chronicDiseases: string;
  pastDiseases: string;
  currentMedications: string;
  // Step 3
  smoking: string;
  alcohol: string;
  exerciseFrequency: string;
  height: string;
  weight: string;
  // Step 4
  emergencyName: string;
  emergencyPhone: string;
  familyHistory: string;
  ongoingTreatments: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

interface OnboardingFormProps {
  onComplete: (data: FormData) => Promise<void> | void;
}

const OnboardingForm = ({ onComplete }: OnboardingFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    dob: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    bloodGroup: "",
    allergies: "",
    chronicDiseases: "",
    pastDiseases: "",
    currentMedications: "",
    smoking: "no",
    alcohol: "no",
    exerciseFrequency: "",
    height: "",
    weight: "",
    emergencyName: "",
    emergencyPhone: "",
    familyHistory: "",
    ongoingTreatments: "",
  });

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onComplete(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.fullName.trim() !== "" && formData.dob !== "" && formData.phone.trim() !== "";
      case 1:
        return formData.bloodGroup !== "";
      default:
        return true;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      {/* Progress indicator */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  index < currentStep
                    ? "bg-black text-white"
                    : index === currentStep
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-gray-100 text-gray-400"
                )}
              >
                <step.icon size={20} />
              </div>
              <span className={cn(
                "text-[10px] mt-2 font-black uppercase tracking-widest hidden sm:block",
                index === currentStep ? "text-blue-600" : "text-gray-400"
              )}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-none shadow-2xl shadow-black/5 rounded-[2.5rem] overflow-hidden bg-white">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentVariants}
              >
                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                  <div className="p-8 md:p-12">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-3xl font-black tracking-tighter">Basic Information</CardTitle>
                      <CardDescription className="text-gray-400 font-medium">Capture your essential profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest">Full Name *</Label>
                          <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => updateFormData("fullName", e.target.value)}
                            className="rounded-2xl border-gray-100 focus:ring-blue-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dob" className="text-[10px] font-black uppercase tracking-widest">Date of Birth *</Label>
                          <Input
                            id="dob"
                            type="date"
                            value={formData.dob}
                            onChange={(e) => updateFormData("dob", e.target.value)}
                            className="rounded-2xl border-gray-100 focus:ring-blue-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age" className="text-[10px] font-black uppercase tracking-widest">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            placeholder="38"
                            value={formData.age}
                            onChange={(e) => updateFormData("age", e.target.value)}
                            className="rounded-2xl border-gray-100 focus:ring-blue-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-[10px] font-black uppercase tracking-widest">Gender</Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(val) => updateFormData("gender", val)}
                          >
                            <SelectTrigger className="rounded-2xl border-gray-100">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest">Phone Number *</Label>
                          <Input
                            id="phone"
                            placeholder="+1 234 567 890"
                            value={formData.phone}
                            onChange={(e) => updateFormData("phone", e.target.value)}
                            className="rounded-2xl border-gray-100 focus:ring-blue-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest">Address</Label>
                          <Input
                            id="address"
                            placeholder="Lviv, Ukraine"
                            value={formData.address}
                            onChange={(e) => updateFormData("address", e.target.value)}
                            className="rounded-2xl border-gray-100 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </div>
                )}

                {/* Step 2: Medical Info */}
                {currentStep === 1 && (
                  <div className="p-8 md:p-12">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-3xl font-black tracking-tighter">Medical Information</CardTitle>
                      <CardDescription className="text-gray-400 font-medium">Critical data for health timeline and analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="bloodGroup" className="text-[10px] font-black uppercase tracking-widest">Blood Group *</Label>
                          <Select
                            value={formData.bloodGroup}
                            onValueChange={(val) => updateFormData("bloodGroup", val)}
                          >
                            <SelectTrigger className="rounded-2xl border-gray-100">
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="allergies" className="text-[10px] font-black uppercase tracking-widest">Allergies</Label>
                          <Input
                            id="allergies"
                            placeholder="Peanuts, Penicillin"
                            value={formData.allergies}
                            onChange={(e) => updateFormData("allergies", e.target.value)}
                            className="rounded-2xl border-gray-100 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chronicDiseases" className="text-[10px] font-black uppercase tracking-widest">Chronic Diseases</Label>
                        <Input
                          id="chronicDiseases"
                          placeholder="Diabetes, Asthma"
                          value={formData.chronicDiseases}
                          onChange={(e) => updateFormData("chronicDiseases", e.target.value)}
                          className="rounded-2xl border-gray-100 focus:ring-blue-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pastDiseases" className="text-[10px] font-black uppercase tracking-widest">Past Medical History</Label>
                        <Textarea
                          id="pastDiseases"
                          placeholder="List significant past illnesses or surgeries"
                          value={formData.pastDiseases}
                          onChange={(e) => updateFormData("pastDiseases", e.target.value)}
                          className="rounded-2xl border-gray-100 focus:ring-blue-600 min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currentMedications" className="text-[10px] font-black uppercase tracking-widest">Current Medications</Label>
                        <Input
                          id="currentMedications"
                          placeholder="Aspirin 81mg, etc."
                          value={formData.currentMedications}
                          onChange={(e) => updateFormData("currentMedications", e.target.value)}
                          className="rounded-2xl border-gray-100 focus:ring-blue-600"
                        />
                      </div>
                    </CardContent>
                  </div>
                )}

                {/* Step 3: Lifestyle */}
                {currentStep === 2 && (
                  <div className="p-8 md:p-12">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-3xl font-black tracking-tighter">Lifestyle & Health Factors</CardTitle>
                      <CardDescription className="text-gray-400 font-medium">Daily habits that impact your well-being</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest">Smoking</Label>
                          <RadioGroup
                            value={formData.smoking}
                            onValueChange={(val) => updateFormData("smoking", val)}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="smoke-yes" />
                              <Label htmlFor="smoke-yes" className="font-bold">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="smoke-no" />
                              <Label htmlFor="smoke-no" className="font-bold">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest">Alcohol Consumption</Label>
                          <RadioGroup
                            value={formData.alcohol}
                            onValueChange={(val) => updateFormData("alcohol", val)}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="alc-yes" />
                              <Label htmlFor="alc-yes" className="font-bold">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="alc-no" />
                              <Label htmlFor="alc-no" className="font-bold">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest">Exercise Frequency</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {["Never", "Occasional", "2-3 times/week", "Daily"].map(freq => (
                            <div 
                              key={freq}
                              onClick={() => updateFormData("exerciseFrequency", freq)}
                              className={cn(
                                "p-4 rounded-2xl border transition-all cursor-pointer text-center text-xs font-black uppercase tracking-tighter",
                                formData.exerciseFrequency === freq 
                                  ? "bg-black text-white border-black" 
                                  : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300"
                              )}
                            >
                              {freq}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="height" className="text-[10px] font-black uppercase tracking-widest">Height (cm)</Label>
                          <Input
                            id="height"
                            placeholder="180"
                            value={formData.height}
                            onChange={(e) => updateFormData("height", e.target.value)}
                            className="rounded-2xl border-gray-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight" className="text-[10px] font-black uppercase tracking-widest">Weight (kg)</Label>
                          <Input
                            id="weight"
                            placeholder="75"
                            value={formData.weight}
                            onChange={(e) => updateFormData("weight", e.target.value)}
                            className="rounded-2xl border-gray-100"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </div>
                )}

                {/* Step 4: Emergency */}
                {currentStep === 3 && (
                  <div className="p-8 md:p-12">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-3xl font-black tracking-tighter">Emergency & Additional Info</CardTitle>
                      <CardDescription className="text-gray-400 font-medium">Final details for your secure medical file</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyName" className="text-[10px] font-black uppercase tracking-widest">Emergency Contact Name</Label>
                          <Input
                            id="emergencyName"
                            placeholder="Jane Doe"
                            value={formData.emergencyName}
                            onChange={(e) => updateFormData("emergencyName", e.target.value)}
                            className="rounded-2xl border-gray-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyPhone" className="text-[10px] font-black uppercase tracking-widest">Emergency Contact Phone</Label>
                          <Input
                            id="emergencyPhone"
                            placeholder="+1 987 654 321"
                            value={formData.emergencyPhone}
                            onChange={(e) => updateFormData("emergencyPhone", e.target.value)}
                            className="rounded-2xl border-gray-100"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="familyHistory" className="text-[10px] font-black uppercase tracking-widest">Family Medical History</Label>
                        <Textarea
                          id="familyHistory"
                          placeholder="e.g. History of heart disease in family"
                          value={formData.familyHistory}
                          onChange={(e) => updateFormData("familyHistory", e.target.value)}
                          className="rounded-2xl border-gray-100 min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ongoingTreatments" className="text-[10px] font-black uppercase tracking-widest">Ongoing Treatments</Label>
                        <Input
                          id="ongoingTreatments"
                          placeholder="Physical therapy, etc."
                          value={formData.ongoingTreatments}
                          onChange={(e) => updateFormData("ongoingTreatments", e.target.value)}
                          className="rounded-2xl border-gray-100"
                        />
                      </div>

                      <div className="pt-6 border-t border-gray-50 flex items-center gap-3">
                         <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
                            <CheckCircle size={20} />
                         </div>
                         <div>
                            <p className="text-xs font-black tracking-tight uppercase">Privacy Confirmed</p>
                            <p className="text-[10px] text-gray-400 font-bold leading-tight">Your health data is encrypted using clinical-grade standards.</p>
                         </div>
                      </div>
                    </CardContent>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <CardFooter className="p-8 md:p-12 bg-gray-50 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="rounded-full px-8 py-4"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              
              <Button
                type={currentStep === steps.length - 1 ? "submit" : "button"}
                onClick={(e) => {
                  if (currentStep < steps.length - 1) {
                    e.preventDefault();
                    nextStep();
                  }
                }}
                disabled={!isStepValid() || isSubmitting}
                className={cn(
                  "rounded-full px-12 py-4",
                  currentStep === steps.length - 1 ? "bg-black" : "bg-blue-600"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing
                  </>
                ) : (
                  <>
                    {currentStep === steps.length - 1 ? "Complete Registration" : "Next Step"}
                    {currentStep === steps.length - 1 ? (
                      <Check className="h-4 w-4 ml-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-2" />
                    )}
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      <div className="mt-8 text-center">
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Health Data Portability Protocol v2.4</p>
      </div>
    </div>
  );
};

export default OnboardingForm;
