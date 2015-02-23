'use strict';
(function(){
	var formattedDate = function(dateStamp){
		var date = new Date(dateStamp),
		secDiff = (((new Date()).getTime() - date.getTime()) / 1000),
		dayDiff = Math.floor(secDiff/86400);
		if(isNaN(dayDiff)||dayDiff<0){
			return;
		}
		return (dayDiff===0 && "Today")||(dayDiff===1 && "Yesterday")||(dayDiff<7 && dayDiff.toString()+" days ago")||(Math.ceil(dayDiff/7).toString()+" weeks ago");
	}


	var app = angular.module('app', ['ui.bootstrap', 'ngTextTruncate']);
	app.controller('MainCtrl', function($scope, $http){
		var jobTypeArray = [], listedJobTypes = [], selectedJobTypes = [], listedJobs = [];

		/* get open data */
		$http({method: 'GET', url: './json/jobs.json'}).success(
			function(response){
				$scope.jobs = [];
				angular.forEach(response, function(job, index) {
					/* format date */
					job.lastUpdated = formattedDate(job.updated_at);

					/* filtering valid jobs */
					if(!job.deleted_at || formattedDate(job.deleted_at)>(new Date())){
						if(job.want_junior || job.want_intermediate || job.want_senior || job.want_executive){					
							$scope.jobs.push(job);
							jobTypeArray.push(job.job_type);
						}
					}
				});

				/* get unique job type */
				listedJobTypes = jobTypeArray.filter(function(element, index, self) {
					return self.indexOf(element) === index;
				});
				$scope.jobTypes = listedJobTypes;
				selectedJobTypes = listedJobTypes.slice(0, listedJobTypes.length);

				/* keep jobs on the list */
				listedJobs = $scope.jobs;
			}
		);

		/* The event when a job type checkbox is clicked */
		$scope.toggleSelection = function toggleSelection(jobType){
			var index = selectedJobTypes.indexOf(jobType);
			if(index>-1)
				selectedJobTypes.splice(index,1);
			else
				selectedJobTypes.push(jobType);
			$scope.getResult();
		}

		/* set level default value */
		$scope.level = {junior: true, intermediate: true, senior: true, executive: true};
		$scope.checkJunior = function(){
			$scope.level.junior = !$scope.level.junior;
			$scope.getResult();
		};

		$scope.checkIntermediate = function(){
			$scope.level.intermediate = !$scope.level.intermediate;
			$scope.getResult();
		};

		$scope.checkSenior = function(){
			$scope.level.senior = !$scope.level.senior;
			$scope.getResult();
		};

		$scope.checkExecutive = function(){
			$scope.level.executive = !$scope.level.executive;
			$scope.getResult();
		};

		/* set lmo default value */
		$scope.dataLMO = false;
		$scope.checkLMO = function(){
			$scope.dataLMO = !$scope.dataLMO;
			$scope.getResult();
		};

		/* Search Elements
			$scope.jobTypes
			$scope.level
			$scope.dataLMO
		*/
		$scope.getResult = function(){
			var searchedJobs = [], keepGoing;
			angular.forEach(listedJobs, function(job, index){
				//lmo
				if(($scope.dataLMO && job.lmo) || !$scope.dataLMO){
					//level
					if(($scope.level.junior && job.want_junior)||($scope.level.intermediate && job.want_intermediate)||($scope.level.senior && job.want_senior)||($scope.level.executive && job.want_executive)){
						//type
						keepGoing = true;
						angular.forEach(selectedJobTypes, function(seletedJobType, index){
							if(keepGoing && job.job_type === seletedJobType){
								searchedJobs.push(job);
								keepGoing = false;
							}
						});
					}
				}
			});
			$scope.jobs = searchedJobs;
		}
	});
})();