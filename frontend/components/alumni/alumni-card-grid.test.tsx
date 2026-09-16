import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AlumniCardGrid } from "./alumni-card-grid";
import type { Alumni, AlumniPreview } from "@/types/alumni";

vi.mock("next/image",()=>({default:({fill,priority,...props}:React.ImgHTMLAttributes<HTMLImageElement>&{fill?:boolean;priority?:boolean})=><img {...props}/>}));
vi.mock("@/lib/api",()=>({getAlumniPreview:vi.fn()}));

const summary={id:1,slug:"aziz",full_name:"Aziz Rahmonov",image_url:"https://images.unsplash.com/photo-demo"} as Alumni;
const preview={...summary,verified:true,position:"Engineer",current_company:"QarshiDU Tech",faculty:"IT",graduation_year:2018,skills:[],is_featured:true,timeline:[{id:1,year:2018,title:"Bitirgan",type:"education",order:0}],achievements:[],sources:[]} as AlumniPreview;

describe("AlumniCardGrid",()=>{
  afterEach(()=>vi.clearAllMocks());

  it("renders a minimal card and opens an accessible quick profile",async()=>{
    const {getAlumniPreview}=await import("@/lib/api");
    vi.mocked(getAlumniPreview).mockResolvedValue(preview);
    render(<AlumniCardGrid alumni={[summary]} locale="uz"/>);
    const card=screen.getByRole("button",{name:/Aziz Rahmonov profilini/i});
    expect(card).toBeInTheDocument();
    expect(card).not.toHaveTextContent("Engineer");
    fireEvent.click(card);
    expect(getAlumniPreview).toHaveBeenCalledWith("aziz",expect.any(AbortSignal));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByText("Engineer — QarshiDU Tech")).toBeInTheDocument();
    fireEvent.keyDown(document,{key:"Escape"});
    await waitFor(()=>expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(card).toHaveFocus();
  });
});
