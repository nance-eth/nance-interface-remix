import { useEffect, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { Combobox } from "@headlessui/react";
import useJBMSearch, {
  JuiceboxProjectAPIResponse,
} from "~/hooks/juicebox-project-search";
import useDebounce from "~/hooks/debounce";
import { classNames } from "~/utils/tailwind";

export interface ProjectOption {
  id: string;
  version: string;
  handle: string;
  projectId: number;
  metadataUri: string;
}

export default function ProjectSearch({
  val,
  setVal,
  inputStyle = "",
  disabled = false,
}: {
  val: number | undefined;
  setVal: (v: number | undefined) => void;
  inputStyle?: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [selectedProject, setSelectedProject] =
    useState<JuiceboxProjectAPIResponse | null>(null);

  const { projects, loading, setQueryParams } = useJBMSearch({ pv: "2" });

  useEffect(() => {
    if (disabled) {
      setVal(0);
    }
  }, [disabled, setVal]);

  useDebounce<string>(query, 300, (k: string) => {
    setQueryParams({ pv: "2", text: k });
  });

  const emptyProject: Pick<
    JuiceboxProjectAPIResponse,
    "handle" | "name" | "project_id"
  > = {
    handle: "",
    project_id: 0,
    name: "No project",
  };

  return (
    <Combobox
      disabled={disabled}
      as="div"
      value={selectedProject}
      onChange={(p: JuiceboxProjectAPIResponse) => {
        setVal(p.project_id);
        setSelectedProject(p);
      }}
      className="w-full"
    >
      <div className="relative">
        <Combobox.Input
          className={classNames(
            "w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm",
            loading && "animate-pulse",
            inputStyle,
            disabled && "bg-gray-100",
          )}
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(
            selectedProject: JuiceboxProjectAPIResponse | undefined,
          ) =>
            selectedProject
              ? `${selectedProject.name} @id: ${selectedProject.project_id}`
              : `${emptyProject.name} @id: ${emptyProject.project_id}`
          }
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <Combobox.Option
            value={emptyProject}
            className={({ active }) =>
              classNames(
                "relative cursor-default select-none py-2 pl-3 pr-9",
                active ? "bg-indigo-600 text-white" : "text-gray-900",
              )
            }
          >
            {({ active, selected }) => (
              <>
                <ProjectInfoEntry project={emptyProject} />

                {selected && (
                  <span
                    className={classNames(
                      "absolute inset-y-0 right-0 flex items-center pr-4",
                      active ? "text-white" : "text-indigo-600",
                    )}
                  >
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </>
            )}
          </Combobox.Option>

          {projects?.map((p) => (
            <Combobox.Option
              key={p.id}
              value={p}
              className={({ active }) =>
                classNames(
                  "relative cursor-default select-none py-2 pl-3 pr-9",
                  active ? "bg-indigo-600 text-white" : "text-gray-900",
                )
              }
            >
              {({ active, selected }) => (
                <>
                  <ProjectInfoEntry project={p} />

                  {selected && (
                    <span
                      className={classNames(
                        "absolute inset-y-0 right-0 flex items-center pr-4",
                        active ? "text-white" : "text-indigo-600",
                      )}
                    >
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox>
  );
}

function ProjectInfoEntry({
  project,
}: {
  project: Pick<JuiceboxProjectAPIResponse, "handle" | "name" | "project_id">;
}) {
  return (
    <div className="flex flex-col">
      <div>
        <span
          className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-green-400"
          aria-hidden="true"
        />

        <span className="ml-2 truncate">{project.name}</span>
      </div>

      <p className="ml-3 truncate text-gray-400">
        {project.handle ? ` @${project.handle}` : ""}
        {` @id: ${project.project_id}` || ""}
      </p>
    </div>
  );
}
