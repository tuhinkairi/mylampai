import Link from "next/link";
import { ChevronDown, Presentation } from "lucide-react";

export function TalentComponent() {
  return (
    <div className="hover:text-black relative text-muted-foreground flex items-center gap-2 group focus:text-black transition-all py-2 px-4 rounded-lg duration-500 hover:transform z-0 ">
      <div>Talent</div>
      <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:-rotate-180 group-hover:text-black transition-all duration-100" />

      <div className="group-hover:w-10 group-hover:h-10 w-0 h-0 bg-slate-100 backdrop-blur-md transform rotate-45 absolute -bottom-12 opacity-0 group-hover:opacity-100 z-0 ease-in-out rounded-sm"></div>
      <div className="max-h-0 overflow-hidden group-hover:max-h-screen group-focus:max-h-screen absolute top-full right-0 translate-x-[61%] backdrop-blur-md w-[600px] ">
        <div className="flex items-stretch p-1 mt-3 gap-2 bg-slate-100 rounded-lg font-normal">
          <ul className="flex place-items-center flex-col bg-white rounded-lg w-full">
            <li className="py-2 px-6 w-full flex items-center gap-4 text-center">
              <div className="p-2 h-8 w-8 bg-green-400 rounded-lg"> 
                <Presentation className="w-4 h-4 text-white  " />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Talent Match</h3>
                <h4 className="font-light">Lorem ipsum dolor sit.</h4>
              </div>
            </li>
            <li className="py-2 px-6 w-full flex items-center gap-4 text-center">
              <div className="p-2 h-8 w-8 bg-green-400 rounded-lg">
                <Presentation className="w-4 h-4 text-white  " />
              </div>
              <div className="text-left">
                <h3 className="font-medium">AI Interviewer</h3>
                <h4 className="font-light">Lorem ipsum dolor sit.</h4>
              </div>
            </li>
            <li className="py-2 px-6 w-full flex items-center gap-4 text-center">
              <div className="p-2 h-8 w-8 bg-green-400 rounded-lg">
                <Presentation className="w-4 h-4 text-white  " />
              </div>
              <div className="text-left">
                <h3 className="font-medium">AI CV Reviewer</h3>
                <h4 className="font-light">Lorem ipsum dolor sit.</h4>
              </div>
            </li>
            <li className="py-2 px-6 w-full flex items-center gap-4 text-center">
              <div className="p-2 h-8 w-8 bg-green-400 rounded-lg">
                <Presentation className="w-4 h-4 text-white  " />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Careers</h3>
                <h4 className="font-light">Lorem ipsum dolor sit.</h4>
              </div>
            </li>
          </ul>
          <div className="max-w-32 w-full"></div>
        </div>
      </div>
    </div>
  );
}

export function RecruiterComponent() {
  // const [email, setEmail] = useState("");

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setEmail(e.target.value);
  // };

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   try {
  //     const res = await fetch("/api/newsletteremails", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email }),
  //     });

  //     if (res.ok) {
  //       toast.success("Subscribed!");
  //       setEmail("");
  //     }
  //   } catch (err) {
  //     toast.error("Failed");
  //     console.log(err);
  //   }
  // };

  return (
    <div className="hover:text-black text-muted-foreground flex items-center gap-2 group relative focus:text-black transition-all py-2 px-4 rounded-lg duration-500 hover:transform ">
      <div>Recruiter</div>
      <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:-rotate-180 group-hover:text-black transition-all duration-100" />

      <div className="group-hover:w-10 group-hover:h-10 w-0 h-0 bg-slate-100 backdrop-blur-md transform rotate-45 absolute -bottom-12 opacity-0 group-hover:opacity-100 z-0 ease-in-out rounded-sm"></div>
      <div className="max-h-0 overflow-hidden group-hover:max-h-screen group-focus:max-h-screen absolute top-full left-0 -translate-x-[43%] backdrop-blur-md w-[600px] rounded-xl">
        <div className="flex items-stretch p-1 mt-3 gap-2 rounded-lg bg-slate-100 font-normal">
          <ul className="flex place-items-center flex-col bg-white rounded-lg w-full">
            <li className="py-2 px-6 w-full flex items-center gap-4 text-center cursor-pointer">
              <div className="p-2 h-8 w-8 bg-green-400 rounded-lg">
                <Presentation className="w-4 h-4 text-white  " />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Talent Match</h3>
                <h4 className="font-light">Lorem ipsum dolor sit.</h4>
              </div>
            </li>
            <li className="py-2 px-6 w-full flex items-center gap-4 text-center cursor-pointer">
              <div className="p-2 h-8 w-8 bg-green-400 rounded-lg">
                <Presentation className="w-4 h-4 text-white  " />
              </div>
              <div className="text-left">
                <h3 className="font-medium">AI Interviewer</h3>
                <h4 className="font-light">Lorem ipsum dolor sit.</h4>
              </div>
            </li>
            <li className="py-2 px-6 w-full flex items-center gap-4 text-center cursor-pointer">
              <div className="p-2 h-8 w-8 bg-green-400 rounded-lg">
                <Presentation className="w-4 h-4 text-white  " />
              </div>
              <div className="text-left">
                <h3 className="font-medium">AI CV Reviewer</h3>
                <h4 className="font-light">Lorem ipsum dolor sit.</h4>
              </div>
            </li>
            <li className="py-2 px-6 w-full flex items-center gap-4 text-center cursor-pointer">
              <div className="p-2 h-8 w-8 bg-green-400 rounded-lg">
                <Presentation className="w-4 h-4 text-white  " />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Careers</h3>
                <h4 className="font-light">Lorem ipsum dolor sit.</h4>
              </div>
            </li>
          </ul>
          <div className="max-w-32 w-full"></div>
        </div>
      </div>
    </div>
  );
}

export function AboutComponent() {
  return (
    <div className="hover:text-black text-muted-foreground flex items-center gap-2 group relative focus:text-black transition-all py-2 px-4 rounded-lg duration-500 hover:transform ">
      <div>About</div>
      <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:-rotate-180 group-hover:text-black transition-all duration-100" />

      <div className="group-hover:w-10 group-hover:h-10 w-0 h-0 bg-slate-100 backdrop-blur-md transform rotate-45 absolute -bottom-12 opacity-0 group-hover:opacity-100 z-0 ease-in-out rounded-sm"></div>
      <div className="max-h-0 overflow-hidden group-hover:max-h-screen group-focus:max-h-screen absolute top-full left-0 -translate-x-2/3 backdrop-blur-md w-[600px] rounded-xl">
        <div className="flex items-stretch p-1 mt-3 gap-2 bg-slate-100 font-normal rounded-lg">
          <ul className="flex place-items-center flex-col bg-white rounded-lg w-full">
            <li className="py-2 px-6 w-full flex items-center gap-4 text-center cursor-pointer">
              <div className="p-2 h-8 w-8 bg-green-400 rounded-lg">
                <Presentation className="w-4 h-4 text-white  " />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Talent Match</h3>
                <h4 className="font-light">Lorem ipsum dolor sit.</h4>
              </div>
            </li>
            <li className="py-2 px-6 w-full flex items-center gap-4 text-center cursor-pointer">
              <div className="p-2 h-8 w-8 bg-green-400 rounded-lg">
                <Presentation className="w-4 h-4 text-white  " />
              </div>
              <div className="text-left">
                <h3 className="font-medium">AI Interviewer</h3>
                <h4 className="font-light">Lorem ipsum dolor sit.</h4>
              </div>
            </li>
            <li className="py-2 px-6 w-full flex items-center gap-4 text-center cursor-pointer">
              <div className="p-2 h-8 w-8 bg-green-400 rounded-lg">
                <Presentation className="w-4 h-4 text-white  " />
              </div>
              <div className="text-left">
                <h3 className="font-medium">AI CV Reviewer</h3>
                <h4 className="font-light">Lorem ipsum dolor sit.</h4>
              </div>
            </li>
            <li className="py-2 px-6 w-full flex items-center gap-4 text-center cursor-pointer">
              <div className="p-2 h-8 w-8 bg-green-400 rounded-lg">
                <Presentation className="w-4 h-4 text-white  " />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Careers</h3>
                <h4 className="font-light">Lorem ipsum dolor sit.</h4>
              </div>
            </li>
          </ul>
          <div className="max-w-32 w-full"></div>
        </div>
      </div>
    </div>
  );
}
